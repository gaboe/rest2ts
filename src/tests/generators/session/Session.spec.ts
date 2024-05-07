import test from "ava";
import SwaggerParser from "@apidevtools/swagger-parser";
import { generate } from "../../../lib/generators";

test("parse session", async t => {
  var api = await SwaggerParser.parse(
    "./src/tests/generators/session/swagger.json",
  );
  const content = await generate(api, "", undefined, true);

  t.snapshot(content);
});

test("Angular parse session", async t => {
  var api = await SwaggerParser.parse(
    "./src/tests/generators/session/swagger.json",
  );
  const content = await generate(api, "", undefined, true, true);

  t.snapshot(content);
});
