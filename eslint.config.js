// Flat config — ESLint 9+. Expo's preset covers React, React Native, hooks
// and TypeScript; eslint-config-prettier disables stylistic rules so ESLint
// and Prettier never disagree. Class ordering is handled by
// prettier-plugin-tailwindcss at format time.
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = defineConfig([
  expoConfig,
  eslintConfigPrettier,
  {
    // Build-time Node scripts (image fetch, seeding) — not part of the app bundle.
    files: ['scripts/**'],
    languageOptions: {
      globals: {
        Buffer: 'readonly',
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        module: 'writable',
        require: 'readonly',
      },
    },
  },
  {
    // Deno Edge Functions and server-rendered email templates are not part of
    // the React Native app — Supabase typechecks and builds them, not us.
    ignores: [
      'dist/*',
      '.expo/*',
      'node_modules/*',
      'expo-env.d.ts',
      'emails/**',
      'supabase/functions/**',
    ],
  },
]);
