#!/usr/bin/env node
import * as opt from "optimist";
import https from "https";
const rootCas = require("ssl-root-cas/latest").create();

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

https.globalAgent.options.ca = rootCas;
https
  .get(source, (resp) => {
    let data = "";

    // A chunk of data has been recieved.
    resp.on("data", (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on("end", () => {
      console.log(JSON.parse(data).explanation);
    });
  })
  .on("error", (err) => {
    console.log("Error: " + err.message);
  });
