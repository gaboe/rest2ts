import { SwaggerSchema } from "../models/SwaggerSchema";
import { renderRoutes } from "../renderers/ApiRoutesRender";
import { generateRoutes } from "./ApiDescriptionGenerator";
import { generateContracts } from "./ContractGenerator";
import { getInfrastructureTemplate } from "../renderers/InfrastructureTemplates";
import { generateServices } from "./ServiceGenerator";
import { render } from "mustache";

export const generate = (
  api: any,
  baseUrl: string,
  generatedCodeBaseUrl: string | undefined,
  areNullableStringsEnabled: boolean = false
) => {
  const swaggerSchema = api as SwaggerSchema;
  const routes = renderRoutes(generateRoutes(swaggerSchema));
  const contracts = generateContracts(swaggerSchema, areNullableStringsEnabled);
  const baseApiUrl = generatedCodeBaseUrl
    ? `const API_URL = ${generatedCodeBaseUrl};`
    : `const API_URL = "${baseUrl}";`;
  const view = {
    routes,
    contracts,
    infrastructure: getInfrastructureTemplate(),
    services: generateServices(swaggerSchema),
    baseApiUrl,
    // raw: JSON.stringify(api, null, 2),
  };
  const content = render(
    "{{{ infrastructure }}}\n{{{ routes }}}\n{{{ contracts }}}\n{{{ baseApiUrl }}}\n\n{{{ services }}}\n{{{ raw }}}",
    view
  );
  return content;
};
