import { SwaggerSchema, Path, Operation } from "../models/SwaggerSchema";

export type ApiDescription = { [pathName: string]: string };

const trimLast = (s: string, c: string) =>
  s[s.length - 1] === c ? s.substring(0, s.length - 1) : s;

const trimStart = (s: string, c: string) =>
  s[0] === c ? s.substring(1, s.length) : s;

const snakeToCamel = (str: string) =>
  str.replace(/([-_]\w)/g, g => g[1].toUpperCase());

export type MethodType = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "";

const getMethodType = (path: Path): MethodType => {
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
  methodType: MethodType;
  isFileResponse: boolean;
};

export const getEndpointsDescriptions = (swagger: SwaggerSchema) => {
  const commonPrefix = Object.keys(swagger.paths).reduce(
    (acc, e) => (getCommonPrefix(e) === acc ? acc : ""),
    getCommonPrefix(Object.keys(swagger.paths)[0]),
  );

  const endpoints: EndpointDescription[][] = Object.keys(swagger.paths).map(
    e => {
      const pathObject = swagger.paths[e];

      const prop = formatUrlToCamelCase(e).replace(commonPrefix, "");

      const versionPattern = /^v\d+(\.\d+)?/;
      const versionMatch = prop.match(versionPattern);
      const version = (versionMatch?.[0] ?? "").toUpperCase();

      const paramIndex = e.indexOf("{");
      const path = paramIndex > 1 ? e.substring(0, paramIndex - 1) : e;
      const methods = [];
      const generate = (methodType: MethodType, operation: Operation) => {
        const formattedName = snakeToCamel(
          `${methodType.toLowerCase()}_${prop}`,
        );
        const name = `${formattedName.replace(version, "")}${
          version === "V1" ? "" : version
        }`;

        return {
          name,
          url: path,
          pathObject,
          originalPath: e,
          methodType,
          isFileResponse:
            operation.responses?.[200]?.content?.["application/json"]?.schema
              .format === "binary",
        };
      };
      const filterHeaderParameters = (operation: Operation) => {
        operation.parameters = (operation.parameters ?? []).filter(
          x => x.in !== "header",
        );
      };

      if (pathObject.get) {
        filterHeaderParameters(pathObject.get);
        methods.push(generate("GET", pathObject.get));
      }
      if (pathObject.delete) {
        filterHeaderParameters(pathObject.delete);
        methods.push(generate("DELETE", pathObject.delete));
      }
      if (pathObject.post) {
        filterHeaderParameters(pathObject.post);
        methods.push(generate("POST", pathObject.post));
      }
      if (pathObject.put) {
        filterHeaderParameters(pathObject.put);
        methods.push(generate("PUT", pathObject.put));
      }
      if (pathObject.patch) {
        filterHeaderParameters(pathObject.patch);
        methods.push(generate("PATCH", pathObject.patch));
      }
      return methods;
    },
  );
  return endpoints.flat();
};

export const generateRoutes = (swagger: SwaggerSchema) => {
  const routes = getEndpointsDescriptions(swagger).reduce((api, e) => {
    api[e.name] = e.url;
    return api;
  }, {} as ApiDescription);

  return routes;
};
