import pluginJs from "@eslint/js";
import globals from "globals";

export default [
  pluginJs.configs.recommended,
  {
    rules: {
      "no-unused-vars": "error",
      "no-undef": "error",
      "space-before-function-paren": "error"
    },
    languageOptions: {
      globals: {
        screenly: "readonly",
        ...globals.browser
      }
    }
  }
];
