const js = require('@eslint/js');

module.exports = [
  {
    ignores: ['node_modules/**', 'functions/node_modules/**', 'test-results/**', 'playwright-report/**', 'src/js/firebase-client.js']
  },
  {
    files: ['src/js/*.js'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script'
    },
    rules: {
      ...js.configs.recommended.rules,
      // The current browser application intentionally shares globals across
      // ordered script tags. Browser smoke tests verify every inline handler.
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'eqeqeq': 'error'
    }
  },
  {
    files: ['src/js/firebase-client.module.js'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-undef': 'off',
      'eqeqeq': 'error'
    }
  }
];
