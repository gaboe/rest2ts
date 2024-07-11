import SwaggerParser from "@apidevtools/swagger-parser";
import { describe, expect, test } from "vitest";
import { generate } from "../lib/generators";

const cases = [
  "petstore",
  "nswag",
  "anonymous_object",
  "allof_anonymous_schema",
  "auth_login",
  "bracket_params",
  "one_of",
  "post_put_bodies",
  "swagger_2_0",
  "multipart_formdata",
  "multipart_formdata_multiplefiles",
];

function fixturePath(name: string) {
  return `./src/tests/fixtures/${name}.json`;
}

function snapshotPath(name: string) {
  return `./__snapshots__/generate_${name}.ts`;
}

for (const name of cases) {
  describe(name, () => {
    test("Generate", async () => {
      const api = await SwaggerParser.parse(fixturePath(name));
      const content = await generate(api);
      expect(content).toMatchFileSnapshot(snapshotPath(name));
    });

    test("Generate with cookies", async () => {
      const api = await SwaggerParser.parse(fixturePath(name));
      const content = await generate(api, false, true);
      expect(content).toMatchFileSnapshot(snapshotPath(`${name}_cookies`));
    });

    test("Generate angular", async () => {
      const api = await SwaggerParser.parse(fixturePath(name));
      const content = await generate(api, true, true);
      expect(content).toMatchFileSnapshot(snapshotPath(`${name}_angular`));
    });
  });
}
