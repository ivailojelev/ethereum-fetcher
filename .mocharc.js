module.exports = {
  spec: "src/**/*.spec.ts",
  extension: ["ts"],
  reporter: "spec",
  "node-option": [
    "experimental-specifier-resolution=node",
    "loader=ts-node/esm",
  ],
  $schema: "https://json.schemastore.org/mocharc.json",
  require: "tsx",
};
