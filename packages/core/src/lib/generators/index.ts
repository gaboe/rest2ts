import { SwaggerSchema } from "../models/SwaggerSchema";
import { renderRoutes } from "../renderers/ApiRoutesRender";
import { generateRoutes } from "./ApiDescriptionGenerator";
import { generateContracts } from "./ContractGenerator";
import {
  getAngularInfrastructureTemplate,
  getInfrastructureTemplate,
} from "../renderers/InfrastructureTemplates";
import { generateServices } from "./ServiceGenerator";
import axios from "axios";
import { generateAngularServices } from "./AngularServiceGenerator";
import { render } from "../renderers/Renderer";

const generateContent = (
  schema: any,
  baseUrl: string,
  generatedCodeBaseUrl: string | undefined,
  isCookiesAuthEnabled: boolean = false,
) => {
  const swaggerSchema = schema as SwaggerSchema;
  const routes = renderRoutes(generateRoutes(swaggerSchema));
  const contracts = generateContracts(swaggerSchema);
  const baseApiUrl = generatedCodeBaseUrl
    ? `const API_URL = ${generatedCodeBaseUrl};`
    : `const API_URL = "${baseUrl}";`;

  const view = {
    routes,
    contracts,
    infrastructure: getInfrastructureTemplate(isCookiesAuthEnabled),
    services: generateServices(swaggerSchema),
    baseApiUrl,
    // raw: JSON.stringify(api, null, 2),
  };
  const content = render(
    "{{{ infrastructure }}}\n{{{ routes }}}\n{{{ contracts }}}\n{{{ baseApiUrl }}}\n\n{{{ services }}}\n{{{ raw }}}",
    view,
  );
  return content;
};

const generateAngularContent = (schema: any) => {
  const swaggerSchema = schema as SwaggerSchema;
  const routes = renderRoutes(generateRoutes(swaggerSchema));
  const contracts = generateContracts(swaggerSchema);

  const view = {
    routes,
    contracts,
    infrastructure: getAngularInfrastructureTemplate(),
    services: generateAngularServices(swaggerSchema),
  };
  const content = render(
    "{{{ infrastructure }}}\n{{{ routes }}}\n{{{ contracts }}}\n\n{{{ services }}}\n",
    view,
  );
  return content;
};

export const generate = async (
  api: any,
  baseUrl: string,
  generatedCodeBaseUrl: string | undefined,
  generateForAngular: boolean = false,
  isCookiesAuthEnabled: boolean = false,
) => {
  if (!!api.swagger && !api.openapi) {
    const response = await axios.post(
      "https://converter.swagger.io/api/convert",
      api,
    );
    if (response.status !== 200) {
      console.error("Failed to convert Swagger 2.0 to OpenAPI 3.0", response);
      return null;
    }
    return generateForAngular
      ? generateAngularContent(response.data)
      : generateContent(
          response.data,
          baseUrl,
          generatedCodeBaseUrl,
          isCookiesAuthEnabled,
        );
  }

  return generateForAngular
    ? generateAngularContent(api)
    : generateContent(api, baseUrl, generatedCodeBaseUrl, isCookiesAuthEnabled);
};
