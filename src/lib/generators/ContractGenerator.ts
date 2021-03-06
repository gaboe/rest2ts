import { SwaggerSchema, Schema } from "../models/SwaggerSchema";
import { render } from "mustache";
import { getTypeNameFromRef } from "./Common";
import { Maybe, Just } from "purify-ts";

const renderProperties = (
  swagger: SwaggerSchema,
  areNullableStringsEnabled: boolean
) => (schema: Schema): string => {
  if (schema.type === "object" && schema.properties) {
    const properties = Object.keys(schema.properties)
      .map((op) => {
        const childProp = (schema.properties as any)[op] as Schema;

        const type = renderProperties(
          swagger,
          areNullableStringsEnabled
        )(childProp);

        const isNullable: boolean =
          (childProp as any).nullable &&
          //TODO rest of condition will be remove, when areNullableStringsEnabled will be deprecated
          (type !== "string" ||
            (type === "string" && areNullableStringsEnabled));

        const view = {
          name: isNullable ? `${op}?` : op,
          type: type,
        };
        return render("{{ name }}: {{ type }};", view);
      })
      .join("\n\t");
    return properties;
  } else if (schema.enum) {
    return schema.enum.map((e) => `${e} = "${e}"`).join(",\n\t");
  } else if (schema.allOf && schema.allOf[0]) {
    const allOf = schema.allOf[0];
    if (allOf.$ref) {
      const typeName = getTypeNameFromRef(allOf.$ref);
      const tt = swagger.components.schemas[typeName];
      if (tt.type === "object") {
        return typeName;
      }
      return `typeof ${typeName}`;
    }
    if (allOf.enum) {
      return allOf.enum.map((e) => e).join(" | ");
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
          .chain((e) => (e instanceof Array ? Just(e[0]) : Just(e)))
          .chain((e) =>
            Just(
              e.$ref
                ? getTypeNameFromRef(e.$ref)
                : renderProperties(swagger, areNullableStringsEnabled)(e)
            )
          )
          .orDefault("");
        return `${arrayTypeSchema}[]`;
      default:
        return (schema.type || schema.allOf) as string;
    }
  } else if (schema.$ref) {
    return schema.$ref.split("/").reverse()[0];
  } else {
    return "any";
  }
};

export const generateContracts = (
  swaggerSchema: SwaggerSchema,
  areNullableStringsEnabled: boolean
) => {
  const rp = renderProperties(swaggerSchema, areNullableStringsEnabled);

  const rows = Object.keys(swaggerSchema.components?.schemas || [])
    .map((k) => {
      const o = swaggerSchema.components.schemas[k];

      const view = {
        name: k,
        properties: rp(o),
      };
      if (o.enum) {
        return render(
          `export enum {{ name }} {\n\t{{{ properties }}}\n}\n`,
          view
        );
      }

      if (o.type === "object") {
        return view.properties.length > 0 && view.properties !== "unknown"
          ? render(
              `export interface {{ name }} {\n\t{{{ properties }}}\n}\n`,
              view
            )
          : render(`export interface {{ name }} {}\n`, view);
      }

      return render(`export const {{ name }} = {{{ properties }}};\n`, view);
    })
    .join("\n");

  return render("{{{ rows }}}", { rows });
};
