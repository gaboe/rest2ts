import { Schema } from "../models/SwaggerSchema";
import { MethodType } from "./ApiDescriptionGenerator";

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
