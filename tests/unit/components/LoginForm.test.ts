import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import LoginForm from '~/components/LoginForm.vue'
import { useAuth } from '~/composables/useAuth'
import { useFormErrors } from '~/composables/useFormErrors'

// Mock composables
vi.mock('~/composables/useAuth')
vi.mock('~/composables/useFormErrors')

describe('LoginForm.vue', () => {
  const mockLogin = vi.fn()
  const mockHandleError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mock implementations
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      logout: vi.fn()
    } satisfies ReturnType<typeof useAuth>)

    vi.mocked(useFormErrors).mockReturnValue({
      handleError: mockHandleError
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

  it('should call handleError when login fails', async () => {
    const error = {
      statusCode: 422,
      data: {
        message: 'These credentials do not match our records.',
        errors: {
          email: ['These credentials do not match our records.']
        }
      }
    }

    mockLogin.mockRejectedValueOnce(error)

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

    // Should call handleError with the error
    expect(mockHandleError).toHaveBeenCalledWith(error)
  })
})
