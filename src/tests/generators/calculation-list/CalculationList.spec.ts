import test from "ava";
import SwaggerParser from "@apidevtools/swagger-parser";
import { generate } from "../../../lib/generators";

test("parse calculation list", async t => {
  var api = await SwaggerParser.parse(
    "./src/tests/generators/calculation-list/swagger.json",
  );
  const content = await generate(api, "baseUrl", undefined, true);

  t.snapshot(content);
});

test("Angular parse calculation list", async t => {
  var api = await SwaggerParser.parse(
    "./src/tests/generators/calculation-list/swagger.json",
  );
  const content = await generate(api, "baseUrl", undefined, true, true);

  t.snapshot(content);
});
