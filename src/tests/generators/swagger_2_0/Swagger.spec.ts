import test from "ava";
import SwaggerParser from "@apidevtools/swagger-parser";
import { generate } from "../../../lib/generators";

test("parse swagger 2.0", async t => {
  var api = await SwaggerParser.parse(
    "./src/tests/generators/swagger_2_0/swagger.json",
  );
  const content = await generate(api, "", undefined, true);

  t.snapshot(content);
});

test("Angular parse swagger 2.0", async t => {
  var api = await SwaggerParser.parse(
    "./src/tests/generators/swagger_2_0/swagger.json",
  );
  const content = await generate(api, "", undefined, true, true);

  t.snapshot(content);
});
