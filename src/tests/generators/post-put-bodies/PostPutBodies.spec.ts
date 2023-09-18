import test from "ava";
import SwaggerParser from "@apidevtools/swagger-parser";
import { generate } from "../../../lib/generators";

test("parse post put bodies", async t => {
  var api = await SwaggerParser.parse(
    "./src/tests/generators/post-put-bodies/swagger.json",
  );
  const content = await generate(api, "", undefined, true);

  t.snapshot(content);
});

test("Angular parse post put bodies", async t => {
  var api = await SwaggerParser.parse(
    "./src/tests/generators/post-put-bodies/swagger.json",
  );
  const content = await generate(api, "", undefined, true, true);

  t.snapshot(content);
});
