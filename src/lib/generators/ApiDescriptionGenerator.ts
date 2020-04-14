import { SwaggerSchema, Path } from "../models/SwaggerSchema";

export type ApiDescription = { [pathName: string]: string };

const trimLast = (s: string, c: string) =>
  s[s.length - 1] === c ? s.substring(0, s.length - 1) : s;

const trimStart = (s: string, c: string) =>
  s[0] === c ? s.substring(1, s.length) : s;

const getMethodType = (path: Path) => {
  if (path.get) {
    return "GET";
  }
  if (path.post) {
    return "POST";
  }

  if (path.put) {
    return "PUT";
  }

  if (path.delete) {
    return "DELETE";
  }
  if (path.patch) {
    return "PATCH";
  }
  return "";
};

export const formatUrlToCamelCase = (str: string) =>
  trimStart(trimLast(str.replace(/[\W_]+/g, "_"), "_"), "_");

const getCommonPrefix = (str: string) =>
  `${formatUrlToCamelCase(str).split("_")[0]}_`;

export type EndpointDescription = {
  name: string;
  url: string;
  pathObject: Path;
  originalPath: string;
  method: string;
};

export const getEndpointsDescriptions = (swagger: SwaggerSchema) => {
  const commonPrefix = Object.keys(swagger.paths).reduce(
    (acc, e) => (getCommonPrefix(e) === acc ? acc : ""),
    getCommonPrefix(Object.keys(swagger.paths)[0])
  );

  const endpoints: EndpointDescription[] = Object.keys(swagger.paths).map(
    (e) => {
      const pathObject = swagger.paths[e];
      const prop = formatUrlToCamelCase(e).replace(commonPrefix, "");

      const paramIndex = e.indexOf("{");
      const path = paramIndex > 1 ? e.substring(0, paramIndex - 1) : e;
      return {
        name: `${prop}_${getMethodType(pathObject)}`,
        url: path,
        pathObject,
        originalPath: e,
        method: getMethodType(pathObject),
      };
    }
  );
  return endpoints;
};

export const generateDescription = (swagger: SwaggerSchema) => {
  const api: ApiDescription = {};

  getEndpointsDescriptions(swagger).forEach((e) => {
    api[e.name] = e.url;
  });

  return api;
};
