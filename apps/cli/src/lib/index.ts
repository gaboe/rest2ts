import { generate } from "./generators";
import { parse } from "@apidevtools/swagger-parser";

async function parseSwagger(source: string) {
  try {
    return await parse(source);
  } catch (err) {
    console.log("parseSwagger ~ err:", err);
    return null;
  }
}

export async function generateApiContent(
  source: string,
  generateForAngular: boolean,
  cookies: boolean
): Promise<string | null> {
  const openAPI = await parseSwagger(source);

  if (!openAPI) {
    console.error("Failed to parse swagger file");
    return null;
  }

  return await generate(openAPI, generateForAngular == true, cookies == true);
}
