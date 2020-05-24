import test from "ava";
import SwaggerParser from "@apidevtools/swagger-parser";
import { generate } from "../../../lib/generators";

test("parse calculation", async (t) => {
  var api = await SwaggerParser.parse(
    "./src/tests/generators/calculation/swagger.json"
  );
  const content = generate(api, "baseUrl", undefined, undefined);

  t.snapshot(content);
});
