const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const eslintPluginPrettier = require('eslint-plugin-prettier');
const angular = require('@angular-eslint/eslint-plugin');
const jsdoc = require('eslint-plugin-jsdoc');

module.exports = [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/.angular/**',
      'app/**',
      'tools/**/tests/**',
      'tools/**/*.mjs',
      'tools/**/templates/**/*.svelte',
      'tools/**/templates/**/*.vue',
      '**/*.svelte',
      '**/*.vue'
    ]
  },

  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./stackblitz/**/tsconfig.json', './tools/**/tsconfig.json'],
        tsconfigRootDir: __dirname,
        sourceType: 'module',
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true }
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      '@angular-eslint': angular,
      prettier: eslintPluginPrettier,
      jsdoc
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'no-console': 0,
      'prettier/prettier': 'error',
      'jsdoc/require-jsdoc': [
        'error',
        {
          require: {
            ClassDeclaration: true,
            FunctionDeclaration: true,
            MethodDefinition: true
          },
          checkConstructors: true
        }
      ],
      'jsdoc/require-description': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          prefix: 'example',
          style: 'kebab-case',
          type: 'element'
        }
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          prefix: 'example',
          style: 'camelCase',
          type: 'attribute'
        }
      ]
    }
  },

  {
    files: ['**/*.tsx'],
    rules: {
      '@angular-eslint/component-selector': 'off',
      '@angular-eslint/directive-selector': 'off'
    }
  }
];
