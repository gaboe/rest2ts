import { render as mustacheRender } from "mustache";

export function render(template: string, view: Record<string, unknown>) {
  return mustacheRender(template, view);
}
