import { ApiDescription } from "../generators/ApiDescriptionGenerator";
import { render } from "./Renderer";

export const renderRoutes = (api: ApiDescription) => {
  const rows = Object.keys(api)
    .map(e => {
      const view = {
        prop: e,
        value: api[e],
      };

      return render(`{{ prop }}: "{{{ value }}}"`, view);
    })
    .join(",\n\t");
  const view = render(`export const API_ROUTES = { \n\t{{{ rows }}}\n}\n`, {
    rows,
  });

  return view;
};
