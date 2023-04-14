module.exports = {
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  root: true,
  env: {
    node: true
  },
  ignorePatterns: ["**/dist/"],
  rules: {
    quotes: ["error", "double"],
    "brace-style": ["error", "stroustrup"],
    "max-len": [
      "warn",
      {
        code: 144,
        comments: 200
      }
    ]
  }
};
