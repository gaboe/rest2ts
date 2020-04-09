import { Spec } from "swagger-schema-official";
import { render } from "mustache";

export type ApiDescription = { [pathName: string]: string };

const trimLast = (s: string, c: string) =>
  s[s.length - 1] === c ? s.substring(0, s.length - 1) : s;

const trimStart = (s: string, c: string) =>
  s[0] === c ? s.substring(1, s.length) : s;

export const generateDescription = (spec: Spec) => {
  const api: ApiDescription = {};
  Object.keys(spec.paths).forEach((e) => {
    const k = spec.paths[e];
    const prop = trimStart(trimLast(e.replace(/[\W_]+/g, "_"), "_"), "_");
    api[prop] = e;
  });
  return api;
};
