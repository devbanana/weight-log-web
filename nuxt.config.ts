// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui'],

  components: {
    dirs: []
  },

  imports: {
    autoImport: false
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  appConfig: {
    ui: {
      colors: {
        primary: 'green',
        neutral: 'slate'
      }
    }
  },

  runtimeConfig: {
    public: {
      apiBase: ''
    }
  },

  routeRules: {
    '/': { prerender: true }
  },

  devServer: {
    host: 'weight-log.test'
  },

  compatibilityDate: '2025-01-15',

  typescript: {
    typeCheck: true
  },

  eslint: {
    config: {
      typescript: {
        strict: true,
        tsconfigPath: './tsconfig.json'
      },
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
