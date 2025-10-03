import js from "@eslint/js";
import vue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import typescriptParser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  ...vue.configs["flat/recommended"],
  {
    files: ["**/*.{js,ts,vue}"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: typescriptParser,
        ecmaVersion: "latest",
        sourceType: "module",
        extraFileExtensions: [".vue"],
      },
      globals: {
        console: "readonly",
        document: "readonly",
        window: "readonly",
        screenly: "readonly",
        process: "readonly",
      },
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/no-multiple-template-root": "off",
      "no-unused-vars": "warn",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "*.config.js"],
  },
];