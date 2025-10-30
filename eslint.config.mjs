// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import tseslint from 'typescript-eslint'
import vueparser from 'vue-eslint-parser'

export default withNuxt(
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parser: vueparser,
      parserOptions: {
        parser: tseslint.parser,
        sourceType: 'module',
        projectService: {
          allowDefaultProject: ['eslint.config.mjs']
        }
      }
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': ['error']
    }
  }
)
