import SwaggerParser from "@apidevtools/swagger-parser";
import { describe, expect, test } from "vitest";
import { generate } from "../lib/generators";

function fixturePath(name: string) {
  return `./src/tests/fixtures/${name}`;
}

function snapshotPath(name: string) {
  return `./__snapshots__/${name}`;
}

describe("PetStore API", () => {
  test("Generate ", async () => {
    const api = await SwaggerParser.parse(fixturePath("petstore.json"));
    const content = await generate(api, "", undefined, false);

    expect(content).toMatchFileSnapshot(snapshotPath("petstore.generate.ts"));
  });

  test("Generate angular", async () => {
    const api = await SwaggerParser.parse(fixturePath("petstore.json"));

    const content = await generate(api, "", undefined, true, true);

    expect(content).toMatchFileSnapshot(
      snapshotPath("petstore.generate.angular.ts")
    );
  });
});
