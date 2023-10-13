import test from "ava";
import SwaggerParser from "@apidevtools/swagger-parser";
import { generate } from "../../../lib/generators";

test("problem details", async t => {
  var api = await SwaggerParser.parse(
    "./src/tests/generators/problem-details/swagger.json",
  );
  const content = await generate(api, "", undefined, true);

  t.snapshot(content);
});

test("Angular problem details", async t => {
  var api = await SwaggerParser.parse(
    "./src/tests/generators/problem-details/swagger.json",
  );
  const content = await generate(api, "", undefined, true, true);

  t.snapshot(content);
});
