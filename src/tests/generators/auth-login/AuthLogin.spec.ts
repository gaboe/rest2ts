import test from "ava";
import SwaggerParser from "@apidevtools/swagger-parser";
import { generate } from "../../../lib/generators";

test("parse auth login", async (t) => {
  var api = await SwaggerParser.parse(
    "./src/tests/generators/auth-login/swagger.json"
  );
  const content = generate(api, "");

  t.snapshot(content);
});
