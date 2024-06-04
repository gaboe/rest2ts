/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@rest2ts/eslint-config/library.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.lint.json",
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ["dist", "node_modules", "**/__snapshots__/**"],
};
