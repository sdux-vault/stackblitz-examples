const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const eslintPluginPrettier = require('eslint-plugin-prettier');
const angular = require('@angular-eslint/eslint-plugin');
const jsdoc = require('eslint-plugin-jsdoc');
const vueParser = require('vue-eslint-parser');

module.exports = [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      'tools/**/tests/**',
      'tools/**/*.mjs'
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
  },

  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        project: ['./stackblitz/vue/**/tsconfig.json'],
        tsconfigRootDir: __dirname,
        sourceType: 'module',
        ecmaVersion: 'latest',
        extraFileExtensions: ['.vue']
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
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
      ]
    }
  }
];
