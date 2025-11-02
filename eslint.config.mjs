// @ts-check
import tseslint from 'typescript-eslint'
import pluginVueA11y from 'eslint-plugin-vuejs-accessibility'
import vueparser from 'vue-eslint-parser'
import withNuxt from './.nuxt/eslint.config.mjs'

const getRulesFromConfigs = (config) => {
  const array = Array.isArray(config) ? config : [config]
  return array.reduce((acc, item) => ({ ...acc, ...item.rules }), {})
}

export default withNuxt(
  pluginVueA11y.configs['flat/recommended'],
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
    rules: {
      'import/order': ['error']
    }
  }
)
