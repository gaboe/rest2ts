import { generate } from "./generators";
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
  generateForAngular: boolean,
  cookies: boolean,
  prefixesToRemove: string[],
): Promise<string | null> {
  console.log(`🤖1/3 - Getting OpenAPI definition from ${source}`);

  const openAPI = await parseSwagger(source);

  if (!openAPI) {
    console.error("Failed to parse swagger file");
    return null;
  }

  return await generate(
    openAPI,
    generateForAngular == true,
    cookies == true,
    prefixesToRemove,
  );
}
