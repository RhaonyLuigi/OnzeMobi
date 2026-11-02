const { defineConfig, globalIgnores } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
module.exports = defineConfig([
  globalIgnores([
    "dist/**",
    "dist-pages/**",
    "dist-android/**",
    "qa/**",
    "design/**",
    "test-results/**",
    ".expo/**",
  ]),
  expoConfig,
]);
