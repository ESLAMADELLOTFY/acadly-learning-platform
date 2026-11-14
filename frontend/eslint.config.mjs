import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const frontendRoot = path.dirname(fileURLToPath(import.meta.url));

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [
      "apps/**/*.{js,jsx,ts,tsx,mjs,cjs}",
      "libs/**/*.{js,jsx,ts,tsx,mjs,cjs}",
    ],
    settings: {
      next: {
        rootDir: [
          path.join(frontendRoot, "apps/admin-portal"),
          path.join(frontendRoot, "apps/student-portal"),
        ],
      },
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    "**/.next/**",
    "**/out/**",
    "**/build/**",
    "**/next-env.d.ts",
  ]),
]);

export default eslintConfig;
