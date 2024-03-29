import test from "ava";
import SwaggerParser from "@apidevtools/swagger-parser";
import { generate } from "../../../lib/generators";

test("parse calculation", async t => {
  var api = await SwaggerParser.parse(
    "./src/tests/generators/calculation/swagger.json",
  );
  const content = await generate(api, "baseUrl", undefined, true);

  t.snapshot(content);
});

test("Angular parse calculation", async t => {
  var api = await SwaggerParser.parse(
    "./src/tests/generators/calculation/swagger.json",
  );
  const content = await generate(api, "baseUrl", undefined, true, true);

  t.snapshot(content);
});
