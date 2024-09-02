#!/usr/bin/env node

import { outputFile } from "fs-extra";
import { generateApiContent } from "./lib";
import { Command } from "commander";
import { gradientText } from "./lib/ui/GradientRenderer";

type ProgramProps = {
  source: string | undefined;
  target: string | undefined;
  fileName: string | undefined;
  cookies: boolean;
  generateForAngular: boolean;
  prefixesToRemove?: string[];
  help: never;
};

console.log(`${gradientText("REST2TS")}\n`);

const program = new Command();

program
  .description("Generate TypeScript API clients from Swagger")
  .usage("-s <source> -t <target> [options]")
  .option("-s, --source <path>", "Path to the swagger file")
  .option("-t, --target <path>", "Target path")
  .option(
    "-ng, --generate-for-angular",
    "Generate output for Angular with HttpClient and RxJS",
  )
  .option("-f, --file-name <name>", "Output file name (defaults to Api.ts)")
  .option("--cookies", "Generate API with cookies auth")
  .option(
    "-ptr, --prefixes-to-remove <prefixes>",
    "Prefixes to remove from the generated code",
  )
  .helpOption("-h, --help", "Show help");

program.parse(process.argv);

const options = program.opts<ProgramProps>();

const {
  source,
  target,
  generateForAngular,
  fileName,
  cookies,
  prefixesToRemove,
} = options;

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

const unauthorizedKey = "NODE_TLS_REJECT_UNAUTHORIZED";
process.env[unauthorizedKey] = "0";

const originalEmitWarning = process.emitWarning;
process.emitWarning = (warning, ...args) => {
  if (typeof warning === "string" && warning.includes(unauthorizedKey)) {
    return;
  }
  originalEmitWarning.call(process, warning, ...(args as any));
};

generateApiContent(source, generateForAngular, cookies, prefixesToRemove ?? [])
  .then(content => {
    if (content === null) {
      console.error("Failed to generate api content");
      process.exit(1);
    }
    const outputFilePath = `${target}/${fileName ?? "Api.ts"}`;
    console.log(`✏️ 3/3 - Writing generated code to ${outputFilePath}`);

    outputFile(outputFilePath, content)
      .then(() => {
        console.log(`Done 🫡\n\nThanks for using ${gradientText("REST2TS")}`);
        process.exit(0);
      })
      .catch(err => {
        console.error(err);
        process.exit(1);
      });
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
