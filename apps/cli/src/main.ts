#!/usr/bin/env node
import { Command } from "commander";
// import { outputFile } from "fs-extra";
// import { generateApiContent } from "@rest2ts/core";

type ProgramProps = {
  source: string | undefined;
  target: string | undefined;
  urlValue: string | undefined;
  help: never;
  areNullableStringsEnabled: boolean;
  generateForAngular: boolean;
  fileName: string | undefined;
  cookies: boolean;
};

const program = new Command();

program
  .description("Generate TypeScript API clients from Swagger")
  .usage("-s <source> -t <target> [options]")
  .option("-s, --source <path>", "Path to the swagger file")
  .option("-t, --target <path>", "Target path")
  .option("-v, --url-value <value>", "Base URL value used in generated code")
  .option(
    "-ng, --generate-for-angular",
    "Generate output for Angular with HttpClient and RxJS"
  )
  .option("-f, --file-name <name>", "Output file name (default: Api.ts)")
  .option("--cookies", "Generate API with cookies auth")
  .helpOption("-h, --help", "Show help");

program.parse(process.argv);

const options = program.opts<ProgramProps>();
console.log("🚀 ~ options:", options);

const { source, target, urlValue, generateForAngular, fileName, cookies } =
  options;

// Kontrola potrebných argumentov
if (!source) {
  console.error("Error: Source -s is required.");
  program.outputHelp();
  process.exit(1);
}

if (!target) {
  console.error("Error: Target -t is required.");
  program.outputHelp();
  process.exit(1);
}

console.log(`Getting openAPI from ${source}`);

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const baseUrl = source.substring(0, source.indexOf("/swagger/"));
console.log("🚀 ~ baseUrl:", baseUrl);
