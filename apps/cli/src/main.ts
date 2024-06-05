#!/usr/bin/env node

import { outputFile } from "fs-extra";
import { generateApiContent } from "./lib";
import { Command } from "commander";

type ProgramProps = {
  source: string | undefined;
  target: string | undefined;
  fileName: string | undefined;
  cookies: boolean;
  generateForAngular: boolean;
  help: never;
};

const program = new Command();

program
  .description("Generate TypeScript API clients from Swagger")
  .usage("-s <source> -t <target> [options]")
  .option("-s, --source <path>", "Path to the swagger file")
  .option("-t, --target <path>", "Target path")
  .option(
    "-ng, --generate-for-angular",
    "Generate output for Angular with HttpClient and RxJS"
  )
  .option("-f, --file-name <name>", "Output file name (defaults to Api.ts)")
  .option("--cookies", "Generate API with cookies auth")
  .helpOption("-h, --help", "Show help");

program.parse(process.argv);

const options = program.opts<ProgramProps>();

const { source, target, generateForAngular, fileName, cookies } = options;

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

// eslint-disable-next-line turbo/no-undeclared-env-vars
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

generateApiContent(source, generateForAngular, cookies)
  .then((content) => {
    if (content === null) {
      console.error("Failed to generate api content");
      process.exit(1);
    }

    outputFile(`${target}/${fileName ?? "Api.ts"}`, content).catch((err) => {
      console.error(err);
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
