import { Schema, SwaggerSchema } from "../models/SwaggerSchema";
import { EndpointDescription, MethodType } from "./ApiDescriptionGenerator";
import { render } from "../renderers/Renderer";
import { Just, Maybe } from "purify-ts";

export const getTypeNameFromRef = (ref: string) => ref?.split("/").reverse()[0];

export const getTypeNameFromSchema = (
  schema: Schema,
  swagger: SwaggerSchema,
) => {
  if (schema.$ref) {
    return getTypeNameFromRef(schema.$ref);
  }

  if (
    schema.type === "object" &&
    schema.properties &&
    Object.keys(schema.properties).length > 0
  ) {
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
        .map(op => {
          const childProp = (schema.properties as any)[op] as Schema;

          const type = renderProperties(swagger)(childProp);

          const isNullable: boolean = (childProp as any).nullable;
          const isNameArray = op.endsWith("[]");
          const propertyName = isNameArray ? `"${op}"` : op;

          const view = {
            name: isNullable ? `${propertyName}?` : propertyName,
            type: isNullable ? `${type} | null` : type,
          };
          return render("{{{ name }}}: {{{ type }}};", view);
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
          ? "{ [key: string | number]: {{type}} } | null"
          : "{ [key: string | number]: {{type}} }",
        { type },
      );
    } else if (schema.enum) {
      const handleEnumName = (name: string) =>
        schema.type === "integer" ? `_${name}` : name;

      return isEnumDeclaration
        ? schema.enum.map(e => `${handleEnumName(e)} = "${e}"`).join(",\n\t")
        : schema.enum.map(e => `"${e}"`).join(" | ");
    } else if (schema.allOf) {
      return schema.allOf
        .map(x => {
          if (x.$ref) {
            const typeName = getTypeNameFromRef(x.$ref)!;
            const tt = swagger.components.schemas[typeName]!;
            if (schema.type === "object") {
              return renderProperties(swagger)(tt);
            } else if (
              tt.type === "object" ||
              (schema.allOf?.length ?? 0) > 0
            ) {
              return typeName!;
            }
            return `typeof ${typeName}`;
          }
          return renderProperties(swagger)(x);
        })
        .join("\n\t");
    } else if (schema.type) {
      switch (schema.type) {
        case "string":
          return schema.format === "binary" ? "File" : "string";
        case "integer":
          return "number";
        case "object":
          return "unknown";
        case "array": {
          const arrayTypeSchema = Maybe.fromNullable(schema.items)
            .chain(e => (e instanceof Array ? Just(e[0]) : Just(e)))
            .chain(e => {
              if (e!.enum) {
                return Just(
                  `${e!.enum
                    .map(e => (isNaN(parseInt(e)) ? `"${e}"` : e))
                    .join(" | ")}`,
                );
              }

              if (e?.type === "object") {
                return Just(`{\n\t${renderProperties(swagger)(e!)}\n}`);
              }

              return Just(
                e!.$ref
                  ? getTypeNameFromRef(e!.$ref)
                  : renderProperties(swagger)(e!),
              );
            })
            .orDefault("");

          return `${
            arrayTypeSchema?.includes("|")
              ? `(${arrayTypeSchema})`
              : arrayTypeSchema
          }[]`;
        }
        default:
          return (schema.type || schema.allOf) as string;
      }
    } else if (schema.$ref) {
      return schema.$ref.split("/").reverse()[0]!;
    } else if ((schema as any).oneOf) {
      const oneOf = (schema as any).oneOf as Schema[];

      return oneOf.map(e => renderProperties(swagger)(e)).join(" | ");
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
    .filter(x => !!x.$ref)
    .map(({ $ref }) => {
      const typeName = getTypeNameFromRef($ref!)!;
      const t = swagger.components.schemas[typeName];
      return renderProperties(swagger)(t!);
    })
    .join("\n\t");

  return `\n\t${properties}`;
};

export const getMultipartConversion = (
  endpointDescription: EndpointDescription,
  formattedRequestContractType: string,
  paramType: string,
  paramName: string,
): string => {
  const isMultipart =
    !!endpointDescription.pathObject.post?.requestBody?.content[
      "multipart/form-data"
    ];

  if (!!formattedRequestContractType) {
    return `const requestData = getApiRequestData<${paramType}>(${paramName}, ${isMultipart});\n`;
  }

  return `const requestData = getApiRequestData<object>(undefined, ${isMultipart});\n`;
};
