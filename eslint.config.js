import js from '@eslint/js';
import google from 'eslint-config-google';

export default [
  js.configs.recommended,

  {
    ...google,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs'
    },
    rules: {
      'max-len': ['error', { code: 120 }],
      'require-jsdoc': 'off'
    }
  }
];
