import type { Form } from '#ui/types'

/**
 * Type definition for UAuthForm template ref exposed properties.
 * Based on UAuthForm's defineExpose({ formRef, state }) for type-safe access.
 * @template T - The form state/credentials type (e.g., LoginCredentials, RegisterCredentials)
 * @see {@link https://github.com/nuxt/ui/blob/main/src/runtime/components/AuthForm.vue}
 * @example
 * ```typescript
 * const form = useTemplateRef<AuthFormInstance<LoginCredentials>>('login-form')
 * form.value?.formRef.setErrors([...])
 * ```
 */
export interface AuthFormInstance<T = object> {
  formRef: Form<T>
  state: T
}
