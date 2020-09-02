#!/usr/bin/env node
import * as opt from "optimist";
// import https from "https";
// const rootCas = require("ssl-root-cas/latest").create();
import SwaggerParser from "@apidevtools/swagger-parser";
import fs from "fs-extra";
import { generate } from "./lib/generators";

type ProgramProps = {
  source: string | undefined;
  target: string | undefined;
  urlValue: string | undefined;
  help: never;
  areNullableStringsEnabled: boolean;
};

const optimist = opt
  .usage("Usage: rest2ts -s path/to/swagger.json")
  .alias("h", "help")
  .alias("s", "source")
  .alias("t", "target")
  .alias("v", "urlValue")
  .alias("nullstr", "areNullableStringsEnabled")
  .describe(
    "t",
    "If set, jwt token will be set to local storage with key as value of this param"
  )
  .describe("s", "Path to the swagger file")
  .describe("t", "Target path")
  .describe(
    "b",
    "Base url value used in generated code, can be string, or node global value"
  )
  .describe("nullstr", "Are nullable strings enabled");
const {
  help,
  source,
  target,
  urlValue,
  areNullableStringsEnabled,
} = optimist.argv as ProgramProps;

if (help) {
  optimist.showHelp();
  process.exit(0);
}

console.log("areNullableStringsEnabled", areNullableStringsEnabled);

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

SwaggerParser.parse(source, (err, api) => {
  if (err) {
    console.error(err);
    process.exit(1);
  } else if (api) {
    const content = generate(api, baseUrl, urlValue, areNullableStringsEnabled);

    fs.outputFile(`${target}/Api.ts`, content).catch((err) => {
      console.error(err);
      process.exit(1);
    });
  } else {
    console.error(`Something went wrong`);

    process.exit(1);
  }
});
