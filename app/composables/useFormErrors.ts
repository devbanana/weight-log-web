import type { Form, FormError } from '#ui/types'
import type { Ref } from 'vue'
import type { AuthFormInstance } from '~/types/forms'

import { useToast } from '#ui/composables/useToast'

import { isApiError } from '~/utils/api-error'

type FormRef<T> = Ref<Form<T> | AuthFormInstance<T> | undefined | null>

interface FormErrorsReturn {
  handleError: (error: unknown) => void
}

/**
 * Composable for handling form errors in a consistent way.
 * Handles both field-level validation errors (422 with errors object) and general errors (shown as toasts).
 * Works with both UForm (Form) and UAuthForm (AuthFormInstance) components.
 * @template T - The form state type
 * @param {FormRef} form - Form reference (UForm or UAuthForm)
 * @returns {FormErrorsReturn} Object containing the handleError function
 */
export const useFormErrors = <T = Record<string, unknown>>(
  form: FormRef<T>
): FormErrorsReturn => {
  /**
   * Handles errors from form submissions.
   * For 422 validation errors with field-level errors, sets them on the form.
   * For all other errors, displays a toast notification.
   * @param {unknown} error - The error to handle (typically from API call)
   */
  const handleError = (error: unknown): void => {
    // Check for 422 with field-level validation errors
    if (isApiError(error) && error.statusCode === 422 && error.data?.errors) {
      // Convert Laravel errors to UForm format
      const formErrors: FormError[] = []

      for (const [name, messages] of Object.entries(error.data.errors)) {
        for (const message of messages) {
          formErrors.push({ name, message })
        }
      }

      // Extract the form reference (handle both Form and AuthFormInstance)
      // - If using UAuthForm: formValue is AuthFormInstance<T> with a formRef property
      // - If using UForm: formValue is Form<T> directly
      // This allows the composable to work with both component types
      const formValue = form.value
      const formRef
        = formValue && 'formRef' in formValue ? formValue.formRef : formValue

      formRef?.setErrors(formErrors)
    } else {
      // Show toast for all other errors
      const message
        = isApiError(error) && error.data?.message
          ? error.data.message
          : 'An unexpected error occurred. Please try again.'

      useToast().add({
        title: 'Error',
        description: message,
        color: 'error',
        icon: 'i-lucide-circle-x'
      })
    }
  }

  return { handleError }
}
