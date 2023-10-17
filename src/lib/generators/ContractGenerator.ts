import { SwaggerSchema, Schema } from "../models/SwaggerSchema";
import { render } from "mustache";
import { getTypeNameFromRef } from "./Common";
import { Maybe, Just } from "purify-ts";

const addSchemaAllOf = (
  allOf: Schema[] | null,
  swagger: SwaggerSchema,
  areNullableStringsEnabled: boolean,
): string => {
  if (!allOf?.length) {
    return "";
  }

  const properties = allOf
    .filter(x => !!x.$ref)
    .map(({ $ref }) => {
      const typeName = getTypeNameFromRef($ref!);
      const t = swagger.components.schemas[typeName];
      return renderProperties(swagger, areNullableStringsEnabled)(t);
    })
    .join("\n\t");

  return `\n\t${properties}`;
};

const renderProperties =
  (swagger: SwaggerSchema, areNullableStringsEnabled: boolean) =>
  (schema: Schema): string => {
    if (
      schema.type === "object" &&
      !!Object.keys(schema?.properties ?? {}).length
    ) {
      const properties = Object.keys(schema.properties ?? {})
        .map(op => {
          const childProp = (schema.properties as any)[op] as Schema;

          const type = renderProperties(
            swagger,
            areNullableStringsEnabled,
          )(childProp);

          const isNullable: boolean =
            (childProp as any).nullable &&
            //TODO rest of condition will be remove, when areNullableStringsEnabled will be deprecated
            (type !== "string" ||
              (type === "string" && areNullableStringsEnabled));

          const view = {
            name: isNullable ? `${op}?` : op,
            type: isNullable ? `${type} | null` : type,
          };
          return render("{{ name }}: {{ type }};", view);
        })
        .join("\n\t");
      return properties.concat(
        addSchemaAllOf(
          schema.allOf ?? null,
          swagger,
          areNullableStringsEnabled,
        ),
      );
    } else if (
      schema.type === "object" &&
      !!Object.keys(schema?.additionalProperties ?? {}).length
    ) {
      const type = renderProperties(
        swagger,
        areNullableStringsEnabled,
      )(schema.additionalProperties as Schema);

      const isNullable: boolean =
        (schema.additionalProperties as any).nullable &&
        //TODO rest of condition will be remove, when areNullableStringsEnabled will be deprecated
        (type !== "string" || (type === "string" && areNullableStringsEnabled));

      return render(
        isNullable
          ? "{[key: string | number]: {{{type}}}} | null"
          : "{[key: string | number]: {{{type}}}}",
        { type },
      );
    } else if (schema.enum) {
      return schema.enum.map(e => `${e} = "${e}"`).join(",\n\t");
    } else if (schema.allOf && schema.allOf[0]) {
      const allOf = schema.allOf[0];
      if (allOf.$ref) {
        const typeName = getTypeNameFromRef(allOf.$ref);
        const tt = swagger.components.schemas[typeName];
        if (schema.type === "object") {
          return renderProperties(swagger, areNullableStringsEnabled)(tt);
        } else if (tt.type === "object") {
          return typeName;
        }
        return `typeof ${typeName}`;
      }
      if (allOf.enum) {
        return allOf.enum.map(e => e).join(" | ");
      }
      if (allOf.type === "object") {
        return "any";
      }
      return "any";
    } else if (schema.type) {
      switch (schema.type) {
        case "integer":
          return "number";
        case "object":
          return "unknown";
        case "array":
          const arrayTypeSchema = Maybe.fromNullable(schema.items)
            .chain(e => (e instanceof Array ? Just(e[0]) : Just(e)))
            .chain(e =>
              Just(
                e.$ref
                  ? getTypeNameFromRef(e.$ref)
                  : renderProperties(swagger, areNullableStringsEnabled)(e),
              ),
            )
            .orDefault("");
          return `${arrayTypeSchema}[]`;
        default:
          return (schema.type || schema.allOf) as string;
      }
    } else if (schema.$ref) {
      return schema.$ref.split("/").reverse()[0];
    } else if ((schema as any).oneOf) {
      const oneOf = (schema as any).oneOf as Schema[];

      return oneOf
        .map(e => renderProperties(swagger, areNullableStringsEnabled)(e))
        .join(" | ");
    } else {
      return "any";
    }
  };

export const generateContracts = (
  swaggerSchema: SwaggerSchema,
  areNullableStringsEnabled: boolean,
) => {
  const rp = renderProperties(swaggerSchema, areNullableStringsEnabled);

  const rows = Object.keys(swaggerSchema.components?.schemas || [])
    .map(k => {
      const o = swaggerSchema.components.schemas[k];

      const view = {
        name: k,
        properties: rp(o),
      };

      if (o.enum) {
        return render(
          `export enum {{ name }} {\n\t{{{ properties }}}\n};\n`,
          view,
        );
      }

      if (o.type === "object") {
        return view.properties.length > 0 && view.properties !== "unknown"
          ? render(
              `export type {{ name }} = {\n\t{{{ properties }}}\n};\n`,
              view,
            )
          : render(`export type {{ name }} = {};\n`, view);
      }

      return render(`export const {{ name }} = {{{ properties }}};\n`, view);
    })
    .join("\n");

  return render("{{{ rows }}}", { rows });
};
