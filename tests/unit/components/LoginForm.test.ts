import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import LoginForm from '~/components/LoginForm.vue'
import { useAuth } from '~/composables/useAuth'

// Mock composables
vi.mock('~/composables/useAuth')

vi.mock('#ui/composables/useToast', () => ({
  useToast: vi.fn()
}))

describe('LoginForm.vue', () => {
  const mockLogin = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mock implementations
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      logout: vi.fn()
    })
  })

  it('should render the login form', async () => {
    const wrapper = await mountSuspended(LoginForm)

    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('should call login with form state when submitted', async () => {
    mockLogin.mockResolvedValueOnce(undefined)

    const wrapper = await mountSuspended(LoginForm)

    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    })
  })

  it('should disable submit button while login is pending', async () => {
    // Create a promise we can control
    let resolveLogin!: () => void
    const loginPromise = new Promise<void>((resolve) => {
      resolveLogin = resolve
    })
    mockLogin.mockReturnValueOnce(loginPromise)

    const wrapper = await mountSuspended(LoginForm)

    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')

    const submitButton = wrapper.find('button[type="submit"]')

    // Before submit
    expect(submitButton.attributes('disabled')).toBeUndefined()

    // Start submit
    await wrapper.find('form').trigger('submit.prevent')
    await nextTick()

    // During submit
    expect(submitButton.attributes('disabled')).toBeDefined()

    // Complete login
    resolveLogin()
    await flushPromises()

    // After submit
    expect(submitButton.attributes('disabled')).toBeUndefined()
  })

  it('should initialize with empty email and password', async () => {
    const wrapper = await mountSuspended(LoginForm)

    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')

    expect((emailInput.element as HTMLInputElement).value).toBe('')
    expect((passwordInput.element as HTMLInputElement).value).toBe('')
  })

  it('should render submit button with correct label', async () => {
    const wrapper = await mountSuspended(LoginForm)
    const submitButton = wrapper.find('button[type="submit"]')

    expect(submitButton.text()).toContain('Login')
  })
})
