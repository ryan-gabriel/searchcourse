import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const reactCompilerFalsePositives = {
  "react-hooks/set-state-in-effect": "off",
  "react-hooks/compiler-runtime": "off",
  "react-hooks/immutability": "off",
  "react-hooks/use-memo": "off",
};

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      ...reactCompilerFalsePositives,
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "playwright-report/**", "test-results/**"]),
]);
