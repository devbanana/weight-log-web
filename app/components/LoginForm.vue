<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '#ui/types'
import type { LoginCredentials } from '~/types/auth'
import type { AuthFormInstance } from '~/types/forms'

import { UAuthForm } from '#components'
import { ref, useTemplateRef } from 'vue'
import { z } from 'zod'

import { useAuth } from '~/composables/useAuth'
import { useFormErrors } from '~/composables/useFormErrors'

const schema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

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
const form = useTemplateRef<AuthFormInstance<LoginCredentials>>('login-form')
const { login } = useAuth()
const { handleError } = useFormErrors(form)

const onSubmit = async (
  payload: FormSubmitEvent<LoginCredentials>
): Promise<void> => {
  pending.value = true

  try {
    await login(payload.data)
  } catch (error) {
    handleError(error)
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <UAuthForm
    ref="login-form"
    :fields="fields"
    :schema="schema"
    :loading="pending"
    :submit="{ label: 'Login' }"
    @submit="onSubmit"
  />
</template>
