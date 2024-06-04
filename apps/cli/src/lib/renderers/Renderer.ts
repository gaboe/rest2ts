import { compile } from "handlebars";

export function render(template: string, view: Record<string, unknown>) {
  return compile(template)(view);
}
