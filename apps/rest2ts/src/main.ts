#!/usr/bin/env node
import * as opt from "optimist";
import { outputFile } from "fs-extra";
import { generateApiContent } from "@rest2ts/core";

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

const optimist = opt
  .usage("Usage: rest2ts -s path/to/swagger.json")
  .alias("h", "help")
  .alias("s", "source")
  .alias("t", "target")
  .alias("v", "urlValue")
  .alias("f", "fileName")
  .alias("ng", "generateForAngular")
  .describe("cookies", "If set, api will be generated with cookies auth")
  .describe(
    "t",
    "If set, jwt token will be set to local storage with key as value of this param",
  )
  .describe("s", "Path to the swagger file")
  .describe("t", "Target path")
  .describe(
    "b",
    "Base url value used in generated code, can be string, or node global value",
  )
  .describe(
    "ng",
    "Generates output for angular with HttpClient and Rxjs. Values 0/1",
  )
  .describe("f", "Output file name. Default file name is Api.ts");

const {
  help,
  source,
  target,
  urlValue,
  generateForAngular,
  fileName,
  cookies,
} = optimist.argv as ProgramProps;

if (help) {
  optimist.showHelp();
  process.exit(0);
}

if (source === undefined) {
  console.error("Source -s not set");
  process.exit(1);
}

if (target === undefined) {
  console.error("Target -t not set");
  process.exit(1);
}

console.log(`Getting openAPI from ${source}`);

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const baseUrl = source.substring(0, source.indexOf("/swagger/"));

generateApiContent(source, baseUrl, urlValue, generateForAngular, cookies)
  .then(content => {
    if (content === null) {
      console.error("Failed to generate api content");
      process.exit(1);
    }

    outputFile(`${target}/${fileName ?? "Api.ts"}`, content).catch(err => {
      console.error(err);
      process.exit(1);
    });
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
