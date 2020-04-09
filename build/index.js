#!/usr/bin/env node
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var opt = __importStar(require("optimist"));
var optimist = opt
    .usage("Usage: rest2ts -s path/to/swagger.json")
    .alias("h", "help")
    .alias("s", "source")
    .describe("s", "Path to the swagger file");
var _a = optimist.argv, source = _a.source, help = _a.help;
if (help) {
    optimist.showHelp();
    process.exit(0);
}
if (source === undefined) {
    console.error("Source -s not set");
    process.exit(1);
}
console.log("Getting openAPI from " + source);
