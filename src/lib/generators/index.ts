import { SwaggerSchema } from "../models/SwaggerSchema";
import { renderRoutes } from "../renderers/ApiRoutesRender";
import { generateRoutes } from "./ApiDescriptionGenerator";
import { generateContracts } from "./ContractGenerator";
import { infrastructureTemplate } from "../renderers/InfrastructureTemplates";
import { generateServices } from "./ServiceGenerator";
import { render } from "mustache";

export const generate = (api: any, baseUrl: string) => {
  const swaggerSchema = api as SwaggerSchema;
  const routes = renderRoutes(generateRoutes(swaggerSchema));
  const contracts = generateContracts(swaggerSchema);

  const view = {
    routes,
    contracts,
    infrastructure: infrastructureTemplate,
    services: generateServices(swaggerSchema, baseUrl),
    // raw: JSON.stringify(api, null, 2),
  };
  const content = render(
    "{{{ infrastructure }}}\n{{{ routes }}}\n{{{ contracts }}}\n{{{ services }}}\n{{{ raw }}}",
    view
  );
  return content;
};
