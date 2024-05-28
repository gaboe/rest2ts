// import { render as mustacheRender } from "mustache";
import Mustache from "mustache";

export function render(template: string, view: Record<string, unknown>) {
  return Mustache.render(template, view);
}
