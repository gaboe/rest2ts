import { SwaggerSchema, Path } from "../models/SwaggerSchema";

export type ApiDescription = { [pathName: string]: string };

const trimLast = (s: string, c: string) =>
  s[s.length - 1] === c ? s.substring(0, s.length - 1) : s;

const trimStart = (s: string, c: string) =>
  s[0] === c ? s.substring(1, s.length) : s;

const getPostFix = (path: Path) => {
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

const formatPath = (str: string) =>
  trimStart(trimLast(str.replace(/[\W_]+/g, "_"), "_"), "_");

const getCommonPrefix = (str: string) => `${formatPath(str).split("_")[0]}_`;

export const generateDescription = (spec: SwaggerSchema) => {
  const api: ApiDescription = {};

  const commonPrefix = Object.keys(spec.paths).reduce(
    (acc, e) => (getCommonPrefix(e) === acc ? acc : ""),
    getCommonPrefix(Object.keys(spec.paths)[0])
  );

  Object.keys(spec.paths).forEach((e) => {
    const pathObject = spec.paths[e];
    const prop = formatPath(e).replace(commonPrefix, "");

    const paramIndex = e.indexOf("{");
    const path = paramIndex > 1 ? e.substring(0, paramIndex - 1) : e;

    api[`${prop}_${getPostFix(pathObject)}`] = path;
  });
  return api;
};
