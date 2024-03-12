import test from "ava";
import SwaggerParser from "@apidevtools/swagger-parser";
import { generate } from "../../../lib/generators";

test("parser bracket params", async t => {
  var api = await SwaggerParser.parse(
    "./src/tests/generators/bracket-params/swagger.json",
  );
  const content = await generate(api, "baseUrl", undefined, true);

  t.snapshot(content);
});

test("Angular parser bracket params", async t => {
  var api = await SwaggerParser.parse(
    "./src/tests/generators/bracket-params/swagger.json",
  );
  const content = await generate(api, "baseUrl", undefined, true, true);

  t.snapshot(content);
});
