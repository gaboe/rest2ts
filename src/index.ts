#!/usr/bin/env node
import * as opt from "optimist";
// import https from "https";
// const rootCas = require("ssl-root-cas/latest").create();
import SwaggerParser from "@apidevtools/swagger-parser";
import { generateDescription } from "./generators/ApiDescriptionGenerator";
import { Spec } from "swagger-schema-official";
import fs from "fs-extra";
import { renderDescription } from "./renderers/ApiDescriptionRender";
import { generateContracts } from "./generators/ContractGenerator";
import { SwaggerSchema } from "./models/SwaggerSchema";
import { render } from "mustache";

type ProgramProps = {
  source: string | undefined;
  target: string | undefined;
  help: never;
};

const optimist = opt
  .usage("Usage: rest2ts -s path/to/swagger.json")
  .alias("h", "help")
  .alias("s", "source")
  .alias("t", "target")
  .describe("s", "Path to the swagger file")
  .describe("s", "Target path");

const { help, source, target } = optimist.argv as ProgramProps;

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

SwaggerParser.validate(source, (err, api) => {
  if (err) {
    console.error(err);
    process.exit(1);
  } else if (api) {
    const apiDesc = renderDescription(
      generateDescription(api as SwaggerSchema)
    );
    const contracts = generateContracts(api as SwaggerSchema);
    const view = {
      apiDesc,
      contracts,
    };
    fs.outputFile(
      `${target}/Api.ts`,
      render("{{{ apiDesc }}}\n\n {{{ contracts }}}", view)
    ).catch((err) => {
      console.error(err);
      process.exit(1);
    });
  } else {
    console.error(`Something went wrong`);

    process.exit(1);
  }
});
