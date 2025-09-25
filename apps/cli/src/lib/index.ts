import { generate } from "./generators";
import SwaggerParser, { Options } from "@apidevtools/swagger-parser";

async function parseSwagger(source: string) {
  const parseOptions: Options = {
    resolve: {
      external: false,
    },
    dereference: {
      circular: "ignore",
    },
  };

  try {
    if (source.startsWith("http://") || source.startsWith("https://")) {
      const response = await fetch(source);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const swaggerJson = await response.json();

      return await SwaggerParser.parse(swaggerJson, parseOptions);
    } else {
      return await SwaggerParser.parse(source, parseOptions);
    }
  } catch (err) {
    console.log("Failed to parse swagger file:", err);
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
