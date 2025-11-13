<script setup lang="ts">
import type { Form, FormError } from '#ui/types'

import { useToast } from '#ui/composables/useToast'
import { reactive, ref } from 'vue'

import { useAuth } from '~/composables/useAuth'
import { isApiError } from '~/utils/api-error'

interface LoginState {
  email: string
  password: string
}

const state = reactive<LoginState>({
  email: '',
  password: ''
})

const pending = ref(false)
const form = ref<Form<LoginState>>()
const { login } = useAuth()

const onLogin = async (): Promise<void> => {
  pending.value = true

  try {
    await login(state)
  } catch (error) {
    const toast = useToast()
    if (isApiError(error) && error.statusCode === 422 && error.data?.errors) {
      const errors: FormError[] = []
      const apiErrors = error.data.errors
      for (const [key, fieldErrors] of Object.entries(apiErrors)) {
        // Loop through each error message for the field
        for (const message of fieldErrors) {
          errors.push({
            name: key,
            message
          })
        }
      }

      form.value?.setErrors(errors)
    } else {
      console.error(error)
      toast.add({
        title: 'Unknown Error',
        description: 'An unexpected error occurred. Please try again.',
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
  <UForm
    ref="form"
    :state="state"
    class="space-y-4"
    @submit.prevent="onLogin"
  >
    <UFormField
      label="Email"
      name="email"
      required
    >
      <UInput
        v-model="state.email"
        type="email"
      />
    </UFormField>

    <UFormField
      label="Password"
      name="password"
      required
    >
      <UInput
        v-model="state.password"
        type="password"
      />
    </UFormField>

    <UButton
      type="submit"
      :disabled="pending"
      label="Login"
      block
    />
  </UForm>
</template>
