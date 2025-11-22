import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const base = [...compat.extends("next/core-web-vitals")];

// Load local rules and expose them under a plugin name `local-image-rules`.
const localImageRule = await import(
  "./eslint-rules/no-next-image-priority.cjs"
);
const localServerRule = await import("./eslint-rules/no-server-imports.cjs");
const localHeavyDepsRule = await import(
  "./eslint-rules/no-heavy-client-deps.cjs"
);

const eslintConfig = [
  ...base,
  {
    plugins: {
      "local-image-rules": {
        rules: {
          "no-next-image-priority": localImageRule.default || localImageRule,
          "no-server-imports": localServerRule.default || localServerRule,
          "no-heavy-client-deps":
            localHeavyDepsRule.default || localHeavyDepsRule,
        },
      },
    },
    rules: {
      // Warn when `priority` prop is used on `next/image` (non-fatal).
      "local-image-rules/no-next-image-priority": "warn",
      // Warn when server-only packages are imported from client code.
      "local-image-rules/no-server-imports": "warn",
      // Warn when heavy client libraries are statically imported in client code.
      "local-image-rules/no-heavy-client-deps": "warn",
    },
  },
];

export default eslintConfig;
