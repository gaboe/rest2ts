import { Spec } from "swagger-schema-official";
import { render } from "mustache";
const trimLast = (s: string, c: string) =>
  s[s.length - 1] === c ? s.substring(0, s.length - 1) : s;

const trimStart = (s: string, c: string) =>
  s[0] === c ? s.substring(1, s.length) : s;

export const generateDescription = (spec: Spec) => {
  const api: { [pathName: string]: string } = {};
  const rows = Object.keys(spec.paths)
    .map((e) => {
      const k = spec.paths[e];
      const prop = trimStart(trimLast(e.replace(/[\W_]+/g, "_"), "_"), "_");
      api[prop] = e;
      const view = {
        prop,
        value: e,
      };

      return render(`{{ prop }}: "{{{ value }}}"`, view);
    })
    .join(",\n\t");
  const view = render(`const API = { \n\t{{{ rows }}}\n}`, { rows });
  console.log(view);

  return view;
};
