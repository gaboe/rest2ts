import { SwaggerSchema, Schema } from "../models/SwaggerSchema";
import { render } from "mustache";
import { getTypeNameFromRef } from "./Common";
import { Maybe, Just } from "purify-ts";

const renderProperties = (swagger: SwaggerSchema) => (
  // schemaName: string,
  schema: Schema
): string => {
  if (schema.type === "object" && schema.properties) {
    const properties = Object.keys(schema.properties)
      .map((op) => {
        const childProp = (schema.properties as any)[op] as Schema;
        const view = {
          name: op,
          type: renderProperties(swagger)(childProp),
        };
        return render("{{ name }}: {{ type }};", view);
      })
      .join("\n\t");
    return properties;
  } else if (schema.enum) {
    return schema.enum.map((e) => e).join(" | ");
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
  } else {
    switch (schema.type) {
      case "integer":
        return "number";
      case "object":
        return "{}";
      case "array":
        const arrayTypeSchema = Maybe.fromNullable(schema.items)
          .chain((e) => (e instanceof Array ? Just(e[0]) : Just(e)))
          .chain((e) => Just(renderProperties(swagger)(e)))
          .orDefault("");
        return `${arrayTypeSchema}[]`;
      default:
        return (schema.type || schema.allOf) as string;
    }
  }
};

export const generateContracts = (swaggerSchema: SwaggerSchema) => {
  const rp = renderProperties(swaggerSchema);

  const rows = Object.keys(swaggerSchema.components?.schemas || [])
    .map((k) => {
      const o = swaggerSchema.components.schemas[k];

      const view = {
        name: k,
        properties: rp(o),
      };
      if (o.type === "object") {
        return render(`interface {{ name }} {\n\t{{ properties }}\n}\n`, view);
      }
      return render(`const {{ name }} = {{ properties }};\n`, view);
    })
    .join("\n");

  return render("{{{ rows }}}", { rows });
};
