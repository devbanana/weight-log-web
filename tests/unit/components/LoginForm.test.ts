import { useToast } from '#ui/composables/useToast'
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

  it('should show validation error when email is empty', async () => {
    // Mock login to throw validation error for missing email
    mockLogin.mockRejectedValueOnce({
      statusCode: 422,
      data: {
        message: 'The email field is required.',
        errors: {
          email: ['The email field is required.']
        }
      }
    })

    const wrapper = await mountSuspended(LoginForm)

    // Try to submit with only password filled
    await wrapper.find('input[type="password"]').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    // Should call login and show validation error from API
    expect(mockLogin).toHaveBeenCalledWith({
      email: '',
      password: 'password123'
    })
    expect(wrapper.html()).toContain('email field is required')
  })

  it('should show validation error when password is empty', async () => {
    // Mock login to throw validation error for missing password
    mockLogin.mockRejectedValueOnce({
      statusCode: 422,
      data: {
        message: 'The password field is required.',
        errors: {
          password: ['The password field is required.']
        }
      }
    })

    const wrapper = await mountSuspended(LoginForm)

    // Try to submit with only email filled
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    // Should call login and show validation error from API
    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: ''
    })
    expect(wrapper.html()).toContain('password field is required')
  })

  it('should show validation errors when both fields are empty', async () => {
    // Mock login to throw validation error for both fields
    mockLogin.mockRejectedValueOnce({
      statusCode: 422,
      data: {
        message: 'The email field is required. (and 1 more error)',
        errors: {
          email: ['The email field is required.'],
          password: ['The password field is required.']
        }
      }
    })

    const wrapper = await mountSuspended(LoginForm)

    // Try to submit with empty fields
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    // Should call login and show validation errors from API
    expect(mockLogin).toHaveBeenCalledWith({
      email: '',
      password: ''
    })
    expect(wrapper.html()).toContain('email field is required')
  })

  it('should clear previous validation errors on retry', async () => {
    // First attempt fails with email error
    mockLogin.mockRejectedValueOnce({
      statusCode: 422,
      data: {
        message: 'The email field is required.',
        errors: {
          email: ['The email field is required.']
        }
      }
    })

    const wrapper = await mountSuspended(LoginForm)

    // Submit first time with invalid data
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    // Should show validation error
    const htmlAfterFirstSubmit = wrapper.html()
    expect(htmlAfterFirstSubmit).toContain('email field is required')

    // Second attempt also fails with a different error
    mockLogin.mockRejectedValueOnce({
      statusCode: 422,
      data: {
        message: 'The password is too short.',
        errors: {
          password: ['The password is too short.']
        }
      }
    })

    // Fill in email but use short password
    await wrapper.find('input[type="email"]').setValue('valid@example.com')
    await wrapper.find('input[type="password"]').setValue('123')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    // Should show new error but NOT the old email error
    const htmlAfterSecondSubmit = wrapper.html()
    expect(htmlAfterSecondSubmit).not.toContain('email field is required')
    expect(htmlAfterSecondSubmit).toContain('password is too short')
  })

  it('should show toast when 422 error has message but no error fields', async () => {
    const mockToast = { add: vi.fn() }
    vi.mocked(useToast).mockReturnValue(mockToast as never)

    // Mock login to throw 422 with message but no errors field
    mockLogin.mockRejectedValueOnce({
      statusCode: 422,
      data: {
        message: 'Too many login attempts. Please try again later.'
      }
    })

    const wrapper = await mountSuspended(LoginForm)

    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    // Should show toast with the API message
    expect(mockToast.add).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Too many login attempts. Please try again later.',
      color: 'error',
      icon: 'i-lucide-circle-x'
    })

    // Should NOT show inline field errors
    expect(wrapper.html()).not.toContain('Too many login attempts')
  })

  it('should show generic error toast for non-422 errors without message', async () => {
    const mockToast = { add: vi.fn() }
    vi.mocked(useToast).mockReturnValue(mockToast as never)

    // Mock login to throw a non-422 error without a message
    mockLogin.mockRejectedValueOnce({
      statusCode: 500,
      data: {}
    })

    const wrapper = await mountSuspended(LoginForm)

    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    // Should show toast with generic fallback message
    expect(mockToast.add).toHaveBeenCalledWith({
      title: 'Error',
      description: 'An unexpected error occurred. Please try again.',
      color: 'error',
      icon: 'i-lucide-circle-x'
    })
  })
})
