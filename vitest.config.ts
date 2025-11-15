import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    setupFiles: ['./tests/vitest.setup.ts'],
    include: ['tests/**/*.test.ts'],
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom'
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 70,
        functions: 60,
        branches: 90,
        statements: 70
      },
      exclude: [
        'node_modules/',
        '.nuxt/',
        '.output/',
        'dist/',
        'tests/',
        '**/*.config.ts',
        '**/*.d.ts'
      ]
    }
  }
})
