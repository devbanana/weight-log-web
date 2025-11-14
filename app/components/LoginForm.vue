<script setup lang="ts">
import type { AuthFormField, Form, FormError, FormSubmitEvent } from '#ui/types'

import { UAuthForm } from '#components'
import { useToast } from '#ui/composables/useToast'
import { ref, useTemplateRef } from 'vue'

import { useAuth } from '~/composables/useAuth'
import { isApiError } from '~/utils/api-error'

interface LoginState {
  email: string
  password: string
}

interface AuthFormInstance {
  formRef: Form<LoginState>
  state: LoginState
}

const fields: AuthFormField[] = [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'Enter your email',
    required: true,
    defaultValue: ''
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
    required: true,
    defaultValue: ''
  }
]

const pending = ref(false)
const form = useTemplateRef<AuthFormInstance>('login-form')
const { login } = useAuth()

const onSubmit = async (
  payload: FormSubmitEvent<LoginState>
): Promise<void> => {
  pending.value = true

  try {
    await login(payload.data)
  } catch (error) {
    // Handle 422 validation errors with field-specific errors
    if (isApiError(error) && error.statusCode === 422 && error.data?.errors) {
      const errors: FormError[] = []
      for (const [name, fieldErrors] of Object.entries(error.data.errors)) {
        // Loop through each error message for the field
        for (const message of fieldErrors) {
          errors.push({
            name,
            message
          })
        }
      }

      form.value?.formRef.setErrors(errors)
    } else {
      // Handle all other errors (422 with message only, non-422 errors, etc.)
      const errorMessage
        = isApiError(error) && error.data?.message
          ? error.data.message
          : 'An unexpected error occurred. Please try again.'

      useToast().add({
        title: 'Error',
        description: errorMessage,
        color: 'error',
        icon: 'i-lucide-circle-x'
      })
    }
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <UAuthForm
    ref="login-form"
    :fields="fields"
    :loading="pending"
    :submit="{ label: 'Login' }"
    @submit="onSubmit"
  />
</template>
