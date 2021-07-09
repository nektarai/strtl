module.exports = {
  env: { es6: true, commonjs: true, jest: true },
  extends: ["eslint:recommended"],
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    "no-await-in-loop": "error",
    "no-console": "error",
    "no-loss-of-precision": "error",
    "no-promise-executor-return": "error",
    "no-template-curly-in-string": "error",
    "no-unreachable-loop": "error",
    "no-unsafe-optional-chaining": "error",
    "no-useless-backreference": "error",
    "require-atomic-updates": "error",
    "no-unused-vars": ["error", {
      ignoreRestSiblings: true,
      varsIgnorePattern: "^_",
      argsIgnorePattern: "^_",
      caughtErrors: "all",
      caughtErrorsIgnorePattern: "_",
    }],

    "semi": "error",
    "indent": ["error", 2, { flatTernaryExpressions: true }],
    "curly": ["error", "multi-line", "consistent"],
    "brace-style": "error",
  },
};
