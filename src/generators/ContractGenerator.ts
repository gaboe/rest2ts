import { SwaggerSchema, Schema } from "../models/SwaggerSchema";
import { render } from "mustache";

const renderProperties = (swaggerSchema: SwaggerSchema) => (
  schemaName: string,
  schema: Schema
): string => {
  console.log("----", schemaName, schema);

  if (schema.type === "object" && schema.properties) {
    const properties = Object.keys(schema.properties)
      .map((op) => {
        const childProp = (schema.properties as any)[op] as Schema;
        const view = {
          name: op,
          type: renderProperties(swaggerSchema)(op, childProp),
        };
        return render("{{ name }}: {{ type }};", view);
      })
      .join("\n\t");
    return properties;
  } else if (schema.enum) {
    return schema.enum.map((e) => e).join(" | ");
  } else if (schema.allOf) {
    console.log(schema.allOf);
    return schema.allOf[0].enum?.map((e) => e).join(" | ") || "";
    // return schema.allOf[0].$ref?.split("/").reverse()[0] || "";
  } else {
    switch (schema.type) {
      case "integer":
        return "number";
      case "object":
        return "{}";
      case "array":
        return "[]";
      default:
        return (schema.type || schema.allOf) as string;
    }
  }
};

export const generateContracts = (swaggerSchema: SwaggerSchema) => {
  const rp = renderProperties(swaggerSchema);

  const rows = Object.keys(swaggerSchema.components.schemas)
    .map((k) => {
      const o = swaggerSchema.components.schemas[k];

      const view = {
        name: k,
        properties: rp(k, o),
      };
      return render(`interface {{ name }} {\n\t{{ properties }}\n}`, view);
    })
    .join("\n");

  return render("{{{ rows }}}", { rows });
};
