import * as Mustache from "mustache";

export function render(template: string, view: Record<string, unknown>) {
  return (Mustache as any).render(template, view);
}
