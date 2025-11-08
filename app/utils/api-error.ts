import type { FetchError } from 'ofetch'
import type { ApiError } from '~/types/api-error'

/**
 * Type guard to check if an error is a FetchError with ApiError data.
 *
 * This is useful for narrowing down error types from API calls to extract
 * structured error messages and validation errors from the Laravel backend.
 * @param {unknown} error - The error to check
 * @returns {boolean} True if the error is a FetchError containing ApiError data
 */
export function isApiError(error: unknown): error is FetchError<ApiError> {
  return (
    typeof error === 'object'
    && error !== null
    && 'data' in error
    && typeof error.data === 'object'
    && error.data !== null
    && 'message' in error.data
    && typeof error.data.message === 'string'
  )
}
