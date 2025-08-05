import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import DicodingSharedConfig from "eslint-config-dicodingacademy";

export default defineConfig([
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '*.config.js',
      '*.config.mjs',
    ],
  },
  DicodingSharedConfig,
  {
    files: ['src/**/*.{js,mjs,cjs}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.node },
  },
  { files: ['src/**/*.js'], languageOptions: { sourceType: 'commonjs' } },
]);
