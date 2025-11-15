import type { Form } from '#ui/types'
import type { Ref } from 'vue'
import type { LoginCredentials } from '~/types/auth'
import type { AuthFormInstance } from '~/types/forms'

import { useToast } from '#ui/composables/useToast'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import { useFormErrors } from '~/composables/useFormErrors'
import { isApiError } from '~/utils/api-error'

vi.mock('#ui/composables/useToast', () => ({
  useToast: vi.fn()
}))

vi.mock('~/utils/api-error', () => ({
  isApiError: vi.fn()
}))

describe('useFormErrors', () => {
  const mockSetErrors = vi.fn()
  const mockToastAdd = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useToast, { partial: true }).mockReturnValue({
      add: mockToastAdd
    })
    vi.mocked(isApiError).mockReturnValue(true)
  })

  it('should set field errors for 422 with errors object', () => {
    const form = ref({ setErrors: mockSetErrors }) as unknown as Ref<
      Form<object>
    >
    const { handleError } = useFormErrors(form)

    const error = {
      statusCode: 422,
      data: {
        message: 'Validation failed',
        errors: {
          email: ['Email is required', 'Email must be valid'],
          password: ['Password is too short']
        }
      }
    }

    handleError(error)

    expect(mockSetErrors).toHaveBeenCalledWith([
      { name: 'email', message: 'Email is required' },
      { name: 'email', message: 'Email must be valid' },
      { name: 'password', message: 'Password is too short' }
    ])
    expect(mockToastAdd).not.toHaveBeenCalled()
  })

  it('should show toast for 422 without errors object', () => {
    const form = ref({ setErrors: mockSetErrors }) as unknown as Ref<
      Form<object>
    >
    const { handleError } = useFormErrors(form)

    const error = {
      statusCode: 422,
      data: {
        message: 'Too many login attempts'
      }
    }

    handleError(error)

    expect(mockSetErrors).not.toHaveBeenCalled()
    expect(mockToastAdd).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Too many login attempts',
      color: 'error',
      icon: 'i-lucide-circle-x'
    })
  })

  it('should show generic toast for non-422 errors', () => {
    const form = ref({ setErrors: mockSetErrors }) as unknown as Ref<
      Form<object>
    >
    const { handleError } = useFormErrors(form)

    const error = { statusCode: 500, data: {} }

    handleError(error)

    expect(mockSetErrors).not.toHaveBeenCalled()
    expect(mockToastAdd).toHaveBeenCalledWith({
      title: 'Error',
      description: 'An unexpected error occurred. Please try again.',
      color: 'error',
      icon: 'i-lucide-circle-x'
    })
  })

  it('should show generic toast for non-API errors', () => {
    vi.mocked(isApiError).mockReturnValue(false)
    const form = ref({ setErrors: mockSetErrors }) as unknown as Ref<
      Form<object>
    >
    const { handleError } = useFormErrors(form)

    const error = new Error('Network timeout')

    handleError(error)

    expect(mockSetErrors).not.toHaveBeenCalled()
    expect(mockToastAdd).toHaveBeenCalledWith({
      title: 'Error',
      description: 'An unexpected error occurred. Please try again.',
      color: 'error',
      icon: 'i-lucide-circle-x'
    })
  })

  it('should handle AuthFormInstance with formRef property', () => {
    const form = ref({
      formRef: { setErrors: mockSetErrors },
      state: { email: '', password: '' }
    }) as unknown as Ref<AuthFormInstance<LoginCredentials>>
    const { handleError } = useFormErrors(form)

    const error = {
      statusCode: 422,
      data: {
        message: 'Validation failed',
        errors: {
          email: ['Invalid email format']
        }
      }
    }

    handleError(error)

    expect(mockSetErrors).toHaveBeenCalledWith([
      { name: 'email', message: 'Invalid email format' }
    ])
    expect(mockToastAdd).not.toHaveBeenCalled()
  })

  it('should handle gracefully when form ref is null', () => {
    const form = ref(null) as unknown as Ref<Form<null>>
    const { handleError } = useFormErrors(form)

    const error = {
      statusCode: 422,
      data: {
        message: 'Validation failed',
        errors: {
          email: ['Invalid email format']
        }
      }
    }

    // Should not throw, just skip setting errors
    expect(() => {
      handleError(error)
    }).not.toThrow()
    expect(mockSetErrors).not.toHaveBeenCalled()
  })
})
