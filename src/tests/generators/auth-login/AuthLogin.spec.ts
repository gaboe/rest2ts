import test from "ava";
import SwaggerParser from "@apidevtools/swagger-parser";
import { generate } from "../../../lib/generators";

test("parse auth login", async t => {
  var api = await SwaggerParser.parse(
    "./src/tests/generators/auth-login/swagger.json",
  );
  const content = await generate(api, "baseUrl", undefined, true);

  t.snapshot(content);
});

test("Angular parse auth login", async t => {
  var api = await SwaggerParser.parse(
    "./src/tests/generators/auth-login/swagger.json",
  );
  const content = await generate(api, "baseUrl", undefined, true, true);

  t.snapshot(content);
});
