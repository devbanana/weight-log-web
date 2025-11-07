// @ts-check
import pluginAntfu from 'eslint-plugin-antfu'
import command from 'eslint-plugin-command/config'
import { jsdoc } from 'eslint-plugin-jsdoc'
import pluginPerfectionist from 'eslint-plugin-perfectionist'
import * as regexpPlugin from 'eslint-plugin-regexp'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import unusedImports from 'eslint-plugin-unused-imports'
import pluginVueA11y from 'eslint-plugin-vuejs-accessibility'
import tseslint from 'typescript-eslint'
import vueparser from 'vue-eslint-parser'

import withNuxt from './.nuxt/eslint.config.mjs'

const getRulesFromConfigs = (config) => {
  const array = Array.isArray(config) ? config : [config]
  return array.reduce((acc, item) => ({ ...acc, ...item.rules }), {})
}

export default withNuxt(
  command(),
  eslintPluginUnicorn.configs.recommended,
  jsdoc({
    config: 'flat/recommended'
  }),
  pluginVueA11y.configs['flat/recommended'],
  regexpPlugin.configs['flat/recommended'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts', '**/*.vue'],
    languageOptions: {
      parser: vueparser,
      parserOptions: {
        parser: tseslint.parser,
        sourceType: 'module',
        projectService: true
      }
    },
    rules: {
      ...getRulesFromConfigs(tseslint.configs.strictTypeChecked),
      ...getRulesFromConfigs(tseslint.configs.stylisticTypeChecked),
      '@typescript-eslint/explicit-function-return-type': ['error'],
      '@typescript-eslint/no-invalid-void-type': ['off'],
      'vue/no-unused-components': ['error']
    }
  },
  {
    /// keep-sorted
    plugins: {
      'antfu': pluginAntfu,
      'perfectionist': pluginPerfectionist,
      'unused-imports': unusedImports
    },
    /// keep-sorted
    rules: {
      'antfu/consistent-chaining': ['error'],
      'antfu/consistent-list-newline': ['error'],
      'antfu/import-dedupe': ['error'],
      'antfu/no-import-dist': ['error'],
      'antfu/no-import-node-modules-by-path': ['error'],
      'eqeqeq': ['error', 'smart'],
      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      'import/first': ['error'],
      'new-cap': [
        'error',
        { capIsNew: false, newIsCap: true, properties: true }
      ],
      'no-alert': ['error'],
      'no-caller': ['error'],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-eval': ['error'],
      'no-extra-bind': ['error'],
      'no-iterator': ['error'],
      'no-labels': ['error', { allowLoop: false, allowSwitch: false }],
      'no-lone-blocks': ['error'],
      'no-lonely-if': ['error'],
      'no-multi-str': ['error'],
      'no-new-func': ['error'],
      'no-new-wrappers': ['error'],
      'no-new': ['error'],
      'no-octal-escape': ['error'],
      'no-proto': ['error'],
      'no-restricted-globals': [
        'error',
        { message: 'Use `globalThis` instead.', name: 'global' },
        { message: 'Use `globalThis` instead.', name: 'self' }
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: ['#imports']
        }
      ],
      'no-restricted-properties': [
        'error',
        {
          message:
            'Use `Object.getPrototypeOf` or `Object.setPrototypeOf` instead.',
          property: '__proto__'
        },
        {
          message: 'Use `Object.defineProperty` instead.',
          property: '__defineGetter__'
        },
        {
          message: 'Use `Object.defineProperty` instead.',
          property: '__defineSetter__'
        },
        {
          message: 'Use `Object.getOwnPropertyDescriptor` instead.',
          property: '__lookupGetter__'
        },
        {
          message: 'Use `Object.getOwnPropertyDescriptor` instead.',
          property: '__lookupSetter__'
        }
      ],
      'no-restricted-syntax': ['error', 'TSExportAssignment'],
      'no-self-compare': ['error'],
      'no-sequences': ['error'],
      'no-template-curly-in-string': ['error'],
      'no-undef-init': ['error'],
      'no-unmodified-loop-condition': ['error'],
      'no-unneeded-ternary': ['error', { defaultAssignment: false }],
      'no-unreachable-loop': ['error', { ignore: [] }],
      'no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTaggedTemplates: true,
          allowTernary: true
        }
      ],
      'no-unused-vars': [
        'error',
        { vars: 'all', args: 'after-used', ignoreRestSiblings: true }
      ],
      'no-use-before-define': [
        'error',
        { classes: false, functions: false, variables: true }
      ],
      'no-useless-call': ['error'],
      'no-useless-computed-key': ['error'],
      'no-useless-rename': [
        'error',
        { ignoreDestructuring: false, ignoreImport: false, ignoreExport: false }
      ],
      'no-useless-return': ['error'],
      'object-shorthand': [
        'error',
        'always',
        {
          avoidQuotes: true,
          ignoreConstructors: false
        }
      ],
      'one-var': ['error', { initialized: 'never' }],
      'perfectionist/sort-exports': [
        'error',
        { order: 'asc', type: 'natural' }
      ],
      'perfectionist/sort-imports': [
        'error',
        {
          groups: [
            [
              'type',
              'parent-type',
              'sibling-type',
              'index-type',
              'internal-type'
            ],
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'side-effect',
            'object',
            'unknown'
          ],
          newlinesBetween: 1,
          order: 'asc',
          type: 'natural'
        }
      ],
      'perfectionist/sort-named-exports': [
        'error',
        { order: 'asc', type: 'natural' }
      ],
      'perfectionist/sort-named-imports': [
        'error',
        { order: 'asc', type: 'natural' }
      ],
      'prefer-arrow-callback': [
        'error',
        {
          allowNamedFunctions: false,
          allowUnboundThis: true
        }
      ],
      'prefer-exponentiation-operator': ['error'],
      'prefer-regex-literals': ['error', { disallowRedundantWrapping: true }],
      'prefer-template': ['error'],
      'symbol-description': ['error'],
      'unicode-bom': ['error', 'never'],
      'unicorn/filename-case': ['off'],
      'unicorn/no-array-for-each': ['off'],
      'unicorn/no-array-reduce': ['off'],
      'unicorn/no-null': ['off'],
      'unicorn/prevent-abbreviations': ['off'],
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          vars: 'all',
          varsIgnorePattern: '^_'
        }
      ],
      'vars-on-top': ['error'],
      'yoda': ['error', 'never']
    }
  }
)
