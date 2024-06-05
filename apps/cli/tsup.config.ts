import { defineConfig } from "tsup";

export default defineConfig({
  format: "cjs",
  target: "es2015",
  dts: true,
  clean: true,
  sourcemap: true,
  minify: true,
  entry: ["src/index.ts"],
  outDir: "dist",
});
