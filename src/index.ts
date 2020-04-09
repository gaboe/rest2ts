#!/usr/bin/env node
import * as opt from "optimist";

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
