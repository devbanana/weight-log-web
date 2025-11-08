<script setup lang="ts">
import { definePageMeta } from '#imports'
import { useToast } from '#ui/composables/useToast'
import { reactive, ref } from 'vue'

import { useAuth } from '~/composables/useAuth'
import { isApiError } from '~/utils/api-error'

definePageMeta({
  middleware: 'guest'
})

const state = reactive({
  email: '',
  password: ''
})

const pending = ref(false)
const { login } = useAuth()

const onLogin = async (): Promise<void> => {
  pending.value = true

  try {
    await login(state)
  } catch (error) {
    const toast = useToast()
    if (isApiError(error) && error.statusCode === 422) {
      toast.add({
        title: 'Login Error',
        description: error.data?.message ?? 'Invalid credentials.',
        color: 'error',
        icon: 'i-lucide-circle-x'
      })
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
  <UContainer class="py-12">
    <UCard class="max-w-lg mx-auto">
      <template #header>
        <h1 class="text-xl font-bold text-center">
          Log in to your account
        </h1>
      </template>

      <UForm
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
    </UCard>
  </UContainer>
</template>
