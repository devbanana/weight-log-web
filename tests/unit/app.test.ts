import type { Ref } from 'vue'
import type { User } from '~/types/user'

import { useSeoMeta } from '#app'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import app from '~/app.vue'

interface MockAuthReturn {
  login: ReturnType<typeof vi.fn>
  logout: ReturnType<typeof vi.fn>
}

interface MockUserReturn {
  user: Ref<User | null>
  isLoggedIn: Ref<boolean>
  clearAuth: ReturnType<typeof vi.fn>
}

vi.mock('~/components/AppLogo.vue')

const mockLogout = vi.fn()
const mockUser = ref<User | null>(null)
const mockIsLoggedIn = ref(false)

vi.mock('~/composables/useAuth', () => ({
  useAuth: (): MockAuthReturn => ({
    login: vi.fn(),
    logout: mockLogout
  })
}))
vi.mock('~/composables/useUser', () => ({
  useUser: (): MockUserReturn => ({
    user: mockUser,
    isLoggedIn: mockIsLoggedIn,
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
  beforeEach(() => {
    mockUser.value = null
    mockIsLoggedIn.value = false
    mockLogout.mockClear()
  })

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

  it('displays login and register buttons when not logged in', async () => {
    mockIsLoggedIn.value = false
    mockUser.value = null

    const wrapper = await mountSuspended(app)

    expect(wrapper.text()).toContain('Login')
    expect(wrapper.text()).toContain('Register')
    expect(wrapper.text()).not.toContain('Logout')
  })

  it('displays user email and logout button when logged in', async () => {
    mockIsLoggedIn.value = true
    mockUser.value = { email: 'test@example.com' } as User

    const wrapper = await mountSuspended(app)

    expect(wrapper.text()).toContain('test@example.com')
    expect(wrapper.text()).toContain('Logout')
    expect(wrapper.text()).not.toContain('Login')
    expect(wrapper.text()).not.toContain('Register')
  })

  it('calls logout when logout button is clicked', async () => {
    mockIsLoggedIn.value = true
    mockUser.value = { email: 'test@example.com' } as User

    const wrapper = await mountSuspended(app)

    const logoutButton = wrapper
      .findAll('button')
      .find(btn => btn.text() === 'Logout')
    expect(logoutButton).toBeDefined()
    await logoutButton?.trigger('click')

    expect(mockLogout).toHaveBeenCalled()
  })
})
