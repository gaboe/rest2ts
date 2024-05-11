import { Schema } from "../models/SwaggerSchema";

export const getTypeNameFromRef = (ref: string) => ref?.split("/").reverse()[0];

export const getTypeNameFromSchema = (schema: Schema) => {
  if (schema.$ref) {
    return getTypeNameFromRef(schema.$ref);
  }

  switch (schema.type) {
    case "number":
    case "integer":
      return "number";

    default:
      return schema.type ?? "any";
  }
};
