import { SwaggerSchema } from "../models/SwaggerSchema";
import { renderDescription } from "../renderers/ApiDescriptionRender";
import { generateDescription } from "./ApiDescriptionGenerator";
import { generateContracts } from "./ContractGenerator";
import { infrastructureTemplate } from "../renderers/InfrastructureTemplates";
import { generateServices } from "./ServiceGenerator";
import { render } from "mustache";

export const generate = (api: any, baseUrl: string) => {
  const swaggerSchema = api as SwaggerSchema;
  const apiDesc = renderDescription(generateDescription(swaggerSchema));
  const contracts = generateContracts(swaggerSchema);
  const view = {
    apiDesc,
    contracts,
    infrastructure: infrastructureTemplate,
    services: generateServices(swaggerSchema, baseUrl),
    // raw: JSON.stringify(api, null, 2),
  };
  const content = render(
    "{{{ infrastructure }}}\n{{{ apiDesc }}}\n{{{ contracts }}}\n{{{ services }}}\n{{{ raw }}}",
    view
  );
  return content;
};
