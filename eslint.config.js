import js from '@eslint/js';
import google from 'eslint-config-google';
import globals from 'globals';

export default [
  js.configs.recommended,

  {
    ...google,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      }
    },
    rules: {
      'max-len': ['error', { code: 120 }],
      'require-jsdoc': 'off'
    }
  }
];
