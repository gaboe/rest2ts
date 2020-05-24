import test from "ava";
import SwaggerParser from "@apidevtools/swagger-parser";
import { generate } from "../../../lib/generators";

test("parse calculation list", async (t) => {
  var api = await SwaggerParser.parse(
    "./src/tests/generators/calculation-list/swagger.json"
  );
  const content = generate(api, "baseUrl", undefined);

  t.snapshot(content);
});
