import type { Ref } from 'vue'

import { useSeoMeta } from '#app'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'

import app from '~/app.vue'

interface MockAuthReturn {
  login: ReturnType<typeof vi.fn>
  logout: ReturnType<typeof vi.fn>
}

interface MockUserReturn {
  user: Ref<null>
  isLoggedIn: Ref<boolean>
  clearAuth: ReturnType<typeof vi.fn>
}

vi.mock('~/components/AppLogo.vue')
vi.mock('~/composables/useAuth', () => ({
  useAuth: (): MockAuthReturn => ({
    login: vi.fn(),
    logout: vi.fn()
  })
}))
vi.mock('~/composables/useUser', () => ({
  useUser: (): MockUserReturn => ({
    user: { value: null } as Ref<null>,
    isLoggedIn: { value: false } as Ref<boolean>,
    clearAuth: vi.fn()
  })
}))

vi.mock('#app', async (importOriginal) => {
  const actual = await importOriginal<typeof import('#app')>()

  return {
    ...actual,
    useSeoMeta: vi.fn()
  }
})

describe('App.vue', () => {
  it('sets a template title', async () => {
    await mountSuspended(app)

    expect(vi.mocked(useSeoMeta)).toHaveBeenCalledWith(
      expect.objectContaining({
        titleTemplate: expect.any(Function) as never
      })
    )

    const titleTemplate
      = vi.mocked(useSeoMeta).mock.lastCall?.[0]?.titleTemplate
    expect(titleTemplate).toBeDefined()
    if (typeof titleTemplate !== 'function') {
      throw new TypeError('titleTemplate is not a function')
    }

    expect(titleTemplate()).toBe('Weight Log')
    expect(titleTemplate('Dashboard')).toBe('Dashboard - Weight Log')
  })

  it('sets the description', async () => {
    await mountSuspended(app)

    expect(vi.mocked(useSeoMeta)).toHaveBeenCalledWith(
      expect.objectContaining({
        description:
          'Smart weight and calorie tracking powered by statistics. See trends, analyze progress, and achieve your goals whether losing, gaining, or maintaining weight.'
      })
    )
  })

  it('sets the site name', async () => {
    await mountSuspended(app)

    expect(vi.mocked(useSeoMeta)).toHaveBeenCalledWith(
      expect.objectContaining({
        ogSiteName: 'Weight Log'
      })
    )
  })
})
