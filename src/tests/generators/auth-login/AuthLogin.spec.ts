import test from "ava";
import SwaggerParser from "@apidevtools/swagger-parser";

test("parse auth login", async (t) => {
  var api = await SwaggerParser.validate(
    "./src/tests/generators/auth-login/swagger.json"
  );
  t.pass();
});
