#!/usr/bin/env node
import * as opt from "optimist";
// import https from "https";
// const rootCas = require("ssl-root-cas/latest").create();
import SwaggerParser from "@apidevtools/swagger-parser";
import { generateDescription } from "./generators/ApiDescriptionGenerator";
import { Spec } from "swagger-schema-official";

type ProgramProps = {
  source: string | undefined;
  help: never;
};

const optimist = opt
  .usage("Usage: rest2ts -s path/to/swagger.json")
  .alias("h", "help")
  .alias("s", "source")
  .describe("s", "Path to the swagger file");

const { source, help } = optimist.argv as ProgramProps;

if (help) {
  optimist.showHelp();
  process.exit(0);
}

if (source === undefined) {
  console.error("Source -s not set");
  process.exit(1);
}

console.log(`Getting openAPI from ${source}`);

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

SwaggerParser.validate(source, (err, api) => {
  if (err) {
    console.error(err);
    process.exit(1);
  } else if (api) {
    const apiDesc = generateDescription(api as Spec);
  } else {
    console.error(`Something went wrong`);

    process.exit(1);
  }
});
