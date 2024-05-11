import { generate } from "./lib/generators";
import SwaggerParser from "@apidevtools/swagger-parser";

async function parseSwagger(source: string) {
  try {
    return await SwaggerParser.parse(source);
  } catch (err) {
    console.log("parseSwagger ~ err:", err);
    return null;
  }
}

export async function generateApiContent(
  source: string,
  baseUrl: string,
  urlValue: string | undefined,
  generateForAngular: boolean,
  cookies: boolean
): Promise<string | null> {
  const openAPI = await parseSwagger(source);

  if (!openAPI) {
    console.error("Failed to parse swagger file");
    return null;
  }

  return await generate(
    openAPI,
    baseUrl,
    urlValue,
    generateForAngular == true,
    cookies == true
  );
}
