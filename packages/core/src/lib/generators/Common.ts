import { Schema, SwaggerSchema } from "../models/SwaggerSchema";
import { MethodType } from "./ApiDescriptionGenerator";
import { render } from "../renderers/Renderer";
import { Just, Maybe } from "purify-ts";

export const getTypeNameFromRef = (ref: string) => ref?.split("/").reverse()[0];

export const getTypeNameFromSchema = (schema: Schema, swagger: SwaggerSchema) => {
  if (schema.$ref) {
    return getTypeNameFromRef(schema.$ref);
  }

  if (schema.type === "object" && schema.properties && Object.keys(schema.properties).length > 0) {
    let propertyRenderer = renderProperties(swagger);
    return "{" + propertyRenderer(schema) + "}";
  }

  switch (schema.type) {
    case "number":
    case "integer":
      return "number";

    default:
      return schema.type ?? "any";
  }
};

export function getStatusCode(status: string, methodType: MethodType) {
  if (status !== "default") {
    return parseInt(status);
  }

  switch (methodType) {
    case "POST":
      return 201;
    case "DELETE":
      return 204;
    default:
      return 200;
  }
}

export const renderProperties =
  (swagger: SwaggerSchema) =>
    (schema: Schema, isEnumDeclaration: boolean = false): string => {
      if (
        schema.type === "object" &&
        !!Object.keys(schema?.properties ?? {}).length
      ) {
        const properties = Object.keys(schema.properties ?? {})
          .map((op) => {
            const childProp = (schema.properties as any)[op] as Schema;

            const type = renderProperties(swagger)(childProp);

            const isNullable: boolean = (childProp as any).nullable;

            const view = {
              name: isNullable ? `${op}?` : op,
              type: isNullable ? `${type} | null` : type,
            };
            return render("{{ name }}: {{{ type }}};", view);
          })
          .join("\n\t");
        return properties.concat(addSchemaAllOf(schema.allOf ?? null, swagger));
      } else if (
        schema.type === "object" &&
        !!Object.keys(schema?.additionalProperties ?? {}).length
      ) {
        const type = renderProperties(swagger)(
          schema.additionalProperties as Schema,
        );

        const isNullable: boolean = (schema.additionalProperties as any).nullable;

        return render(
          isNullable
            ? "{[key: string | number]: {{{type}}}} | null"
            : "{[key: string | number]: {{{type}}}}",
          { type },
        );
      } else if (schema.enum) {
        return isEnumDeclaration
          ? schema.enum.map((e) => `${e} = "${e}"`).join(",\n\t")
          : schema.enum.map((e) => `"${e}"`).join(" | ");
      } else if (schema.allOf && schema.allOf[0]) {
        const allOf = schema.allOf[0];
        if (allOf.$ref) {
          const typeName = getTypeNameFromRef(allOf.$ref)!;
          const tt = swagger.components.schemas[typeName]!;
          if (schema.type === "object") {
            return renderProperties(swagger)(tt);
          } else if (tt.type === "object") {
            return typeName!;
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
          case "array": {
            const arrayTypeSchema = Maybe.fromNullable(schema.items)
              .chain((e) => (e instanceof Array ? Just(e[0]) : Just(e)))
              .chain((e) => {
                if (e!.enum) {
                  return Just(
                    `(${e!.enum
                      .map((e) => (isNaN(parseInt(e)) ? `"${e}"` : e))
                      .join(" | ")})`,
                  );
                }
                return Just(
                  e!.$ref
                    ? getTypeNameFromRef(e!.$ref)
                    : renderProperties(swagger)(e!),
                );
              })
              .orDefault("");
            return `${arrayTypeSchema}[]`;
          }
          default:
            return (schema.type || schema.allOf) as string;
        }
      } else if (schema.$ref) {
        return schema.$ref.split("/").reverse()[0]!;
      } else if ((schema as any).oneOf) {
        const oneOf = (schema as any).oneOf as Schema[];

        return oneOf.map((e) => renderProperties(swagger)(e)).join(" | ");
      } else {
        return "any";
      }
    };

const addSchemaAllOf = (
  allOf: Schema[] | null,
  swagger: SwaggerSchema,
): string => {
  if (!allOf?.length) {
    return "";
  }

  const properties = allOf
    .filter((x) => !!x.$ref)
    .map(({ $ref }) => {
      const typeName = getTypeNameFromRef($ref!)!;
      const t = swagger.components.schemas[typeName];
      return renderProperties(swagger)(t!);
    })
    .join("\n\t");

  return `\n\t${properties}`;
};
