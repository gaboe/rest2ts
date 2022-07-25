import { SwaggerSchema } from "../models/SwaggerSchema";
import { renderRoutes } from "../renderers/ApiRoutesRender";
import { generateRoutes } from "./ApiDescriptionGenerator";
import { generateContracts } from "./ContractGenerator";
import { getInfrastructureTemplate } from "../renderers/InfrastructureTemplates";
import { generateServices } from "./ServiceGenerator";
import { render } from "mustache";
import axios from "axios"

export const generate = async (
  api: any,
  baseUrl: string,
  generatedCodeBaseUrl: string | undefined,
  areNullableStringsEnabled: boolean = false
) => {
  const generateContent = (schema: any) => {
    const swaggerSchema = schema as SwaggerSchema;
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
  }


  if (!!api.swagger && !api.openapi) {
    const response = await axios.post("https://converter.swagger.io/api/convert", api);
    if (response.status !== 200) {
      console.error(response);
      process.exit(1);
    }
    return generateContent(response.data);
  }

  return generateContent(api);

};
