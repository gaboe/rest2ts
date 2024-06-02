import SwaggerParser from "@apidevtools/swagger-parser";
import { describe, expect, test } from "vitest";
import { generate } from "../lib/generators";

function fixturePath(name: string) {
  return `./src/tests/fixtures/${name}.json`;
}

function snapshotPath(name: string) {
  return `./__snapshots__/generate_${name}.ts`;
}

describe("PetStore API", () => {
  test("Generate ", async () => {
    const api = await SwaggerParser.parse(fixturePath("petstore"));
    const content = await generate(api);
    expect(content).toMatchFileSnapshot(snapshotPath("petstore"));
  });

  test("Generate angular", async () => {
    const api = await SwaggerParser.parse(fixturePath("petstore"));
    const content = await generate(api, true, true);
    expect(content).toMatchFileSnapshot(snapshotPath("petstore_angular"));
  });
});

describe("NSwag v14.0.3.0", () => {
  test("Generate ", async () => {
    const api = await SwaggerParser.parse(fixturePath("nswag"));
    const content = await generate(api, false);

    expect(content).toMatchFileSnapshot(snapshotPath("nswag"));
  });

  test("Generate angular", async () => {
    const api = await SwaggerParser.parse(fixturePath("nswag"));

    const content = await generate(api, true, true);

    expect(content).toMatchFileSnapshot(snapshotPath("nswag_angular"));
  });
});
