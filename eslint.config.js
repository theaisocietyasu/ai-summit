module.exports = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "eslint.config.js",
      "package-lock.json",
    ],
  },
  ...require("eslint-config-next/core-web-vitals"),
  ...require("eslint-config-next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
