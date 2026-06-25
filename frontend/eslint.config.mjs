import { defineConfig } from "eslint/config";
import reactPlugin from 'eslint-plugin-react';
import pluginSecurity from 'eslint-plugin-security';
import eslintPluginNoUnsanitized from 'eslint-plugin-no-unsanitized';

export default defineConfig([
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: reactPlugin,
      security: pluginSecurity,
      'no-unsanitized': eslintPluginNoUnsanitized,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'security/detect-eval-with-expression': 'error',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-possible-timing-attacks': 'warn',
      ...eslintPluginNoUnsanitized.configs.recommended.rules,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]);
