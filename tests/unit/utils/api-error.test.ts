import type { ApiError } from '~/types/api-error'

import { describe, expect, it } from 'vitest'

import { isApiError } from '~/utils/api-error'

describe('isApiError', () => {
  it('should return true for valid FetchError with ApiError data', () => {
    const error = {
      data: {
        message: 'Validation failed',
        errors: {
          email: ['The email field is required.']
        }
      },
      statusCode: 422
    }

    expect(isApiError(error)).toBe(true)
  })

  it('should return true for ApiError without errors field', () => {
    const error = {
      data: {
        message: 'Server error occurred'
      },
      statusCode: 500
    }

    expect(isApiError(error)).toBe(true)
  })

  it('should return false for null', () => {
    expect(isApiError(null)).toBe(false)
  })

  it('should return false for undefined', () => {
    expect(isApiError(undefined)).toBe(false)
  })

  it('should return false for primitive types', () => {
    expect(isApiError('error string')).toBe(false)
    expect(isApiError(123)).toBe(false)
    expect(isApiError(true)).toBe(false)
  })

  it('should return false for object without data property', () => {
    const error = {
      message: 'Some error',
      statusCode: 500
    }

    expect(isApiError(error)).toBe(false)
  })

  it('should return false when data is not an object', () => {
    const error = {
      data: 'string data'
    }

    expect(isApiError(error)).toBe(false)
  })

  it('should return false when data is null', () => {
    const error = {
      data: null
    }

    expect(isApiError(error)).toBe(false)
  })

  it('should return false when data.message is missing', () => {
    const error = {
      data: {
        errors: {
          email: ['Invalid email']
        }
      }
    }

    expect(isApiError(error)).toBe(false)
  })

  it('should return false when data.message is not a string', () => {
    const error = {
      data: {
        message: 123
      }
    }

    expect(isApiError(error)).toBe(false)
  })

  it('should correctly narrow type in conditional', () => {
    const errorData: ApiError = {
      message: 'Test error',
      errors: {
        field: ['Error message']
      }
    }
    const error: unknown = {
      data: errorData,
      statusCode: 422
    }

    if (isApiError(error)) {
      // Type should be narrowed to FetchError<ApiError>
      expect(error.data.message).toBe('Test error')
      expect(error.data.errors?.field).toEqual(['Error message'])
    } else {
      throw new Error('Should be ApiError')
    }
  })
})
