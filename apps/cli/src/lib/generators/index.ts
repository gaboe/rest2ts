import { SwaggerSchema } from "../models/SwaggerSchema";
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
  isCookiesAuthEnabled: boolean = false
) => {
  const swaggerSchema = schema as SwaggerSchema;
  const contracts = generateContracts(swaggerSchema);

  const view = {
    infrastructure: getInfrastructureTemplate(isCookiesAuthEnabled),
    contracts,
    services: generateServices(swaggerSchema),
  };
  const content = render(
    "{{{ infrastructure }}}\n{{{ contracts }}}\n{{{ services }}}",
    view
  );
  return content;
};

const generateAngularContent = (schema: any) => {
  const swaggerSchema = schema as SwaggerSchema;
  const contracts = generateContracts(swaggerSchema);

  const view = {
    contracts,
    infrastructure: getAngularInfrastructureTemplate(),
    services: generateAngularServices(swaggerSchema),
  };
  const content = render(
    "{{{ infrastructure }}}\n{{{ contracts }}}\n\n{{{ services }}}\n",
    view
  );
  return content;
};

export const generate = async (
  api: any,
  generateForAngular: boolean = false,
  isCookiesAuthEnabled: boolean = false
) => {
  if (!!api.swagger && !api.openapi) {
    const response = await axios.post(
      "https://converter.swagger.io/api/convert",
      api
    );
    if (response.status !== 200) {
      console.error("Failed to convert Swagger 2.0 to OpenAPI 3.0", response);
      return null;
    }
    return generateForAngular
      ? generateAngularContent(response.data)
      : generateContent(response.data, isCookiesAuthEnabled);
  }

  return generateForAngular
    ? generateAngularContent(api)
    : generateContent(api, isCookiesAuthEnabled);
};
