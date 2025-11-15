import { useToast } from '#ui/composables/useToast'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import LoginForm from '~/components/LoginForm.vue'
import { useAuth } from '~/composables/useAuth'
import { isApiError } from '~/utils/api-error'

// Mock composables
vi.mock('~/composables/useAuth')

vi.mock('#ui/composables/useToast', () => ({
  useToast: vi.fn()
}))

vi.mock('~/utils/api-error', () => ({
  isApiError: vi.fn()
}))

describe('LoginForm.vue', () => {
  const mockLogin = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mock implementations
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      logout: vi.fn()
    } satisfies ReturnType<typeof useAuth>)
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
    await wrapper.find('form').trigger('submit')
    await flushPromises()

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
    await wrapper.find('form').trigger('submit')
    await flushPromises()
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

  it('should show client-side validation error for invalid email', async () => {
    const wrapper = await mountSuspended(LoginForm)

    // Try to submit with invalid email
    await wrapper.find('input[type="email"]').setValue('invalid-email')
    await wrapper.find('input[type="password"]').setValue('password123')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    // Should NOT call login - client-side validation prevents submission
    expect(mockLogin).not.toHaveBeenCalled()

    // Should show client-side validation error
    expect(wrapper.html()).toContain('Invalid email address')
  })

  it('should show client-side validation error for empty password', async () => {
    const wrapper = await mountSuspended(LoginForm)

    // Try to submit with empty password
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    // Should NOT call login - client-side validation prevents submission
    expect(mockLogin).not.toHaveBeenCalled()

    // Should show client-side validation error
    expect(wrapper.html()).toContain('Password is required')
  })

  it('should show client-side validation errors for both fields', async () => {
    const wrapper = await mountSuspended(LoginForm)

    // Try to submit with empty fields
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    // Should NOT call login - client-side validation prevents submission
    expect(mockLogin).not.toHaveBeenCalled()

    // Should show both validation errors
    const html = wrapper.html()
    expect(html).toContain('Invalid email address')
    expect(html).toContain('Password is required')
  })

  it('should show server-side validation error for invalid credentials', async () => {
    // Mock isApiError to return true for this API error
    vi.mocked(isApiError).mockReturnValue(true)

    // Mock login to throw validation error for invalid credentials
    mockLogin.mockRejectedValueOnce({
      statusCode: 422,
      data: {
        message: 'These credentials do not match our records.',
        errors: {
          email: ['These credentials do not match our records.']
        }
      }
    })

    const wrapper = await mountSuspended(LoginForm)

    // Submit with valid-looking data that passes client-side validation
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('wrongpassword')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    // Should call login with valid data
    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'wrongpassword'
    })

    // Should show server-side validation error
    expect(wrapper.html()).toContain(
      'These credentials do not match our records.'
    )
  })

  it('should clear previous validation errors on retry', async () => {
    // Mock isApiError to return true for API errors
    vi.mocked(isApiError).mockReturnValue(true)

    // First attempt fails with email error
    mockLogin.mockRejectedValueOnce({
      statusCode: 422,
      data: {
        message: 'This email is not registered.',
        errors: {
          email: ['This email is not registered.']
        }
      }
    })

    const wrapper = await mountSuspended(LoginForm)

    // Submit first time with valid-looking data
    await wrapper.find('input[type="email"]').setValue('notfound@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    // Should show server validation error
    expect(wrapper.html()).toContain('email is not registered')

    // Second attempt also fails with a different error
    mockLogin.mockRejectedValueOnce({
      statusCode: 422,
      data: {
        message: 'Invalid password.',
        errors: {
          password: ['Invalid password.']
        }
      }
    })

    // Try different credentials
    await wrapper.find('input[type="email"]').setValue('valid@example.com')
    await wrapper.find('input[type="password"]').setValue('wrongpass')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    // Should show new error but NOT the old email error
    expect(wrapper.html()).not.toContain('email is not registered')
    expect(wrapper.html()).toContain('Invalid password')
  })

  it('should show toast when 422 error has message but no error fields', async () => {
    // Mock isApiError to return true (has data.message)
    vi.mocked(isApiError).mockReturnValue(true)

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
    await wrapper.find('form').trigger('submit')
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
    // Mock isApiError to return false (not a properly structured API error)
    vi.mocked(isApiError).mockReturnValue(false)

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
    await wrapper.find('form').trigger('submit')
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
