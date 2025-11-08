<script setup lang="ts">
import { navigateTo } from '#app'
import { definePageMeta } from '#imports'
import { useToast } from '#ui/composables/useToast'
import { computed, reactive } from 'vue'

import { useAPI } from '~/composables/useAPI'

definePageMeta({
  middleware: 'guest'
})

const state = reactive({
  email: '',
  password: ''
})

const { error, pending, execute } = useAPI('/auth/login', {
  method: 'POST',
  body: computed(() => ({ ...state })),
  immediate: false
})

const onLogin = async (): Promise<void> => {
  await execute()

  if (error.value) {
    const toast = useToast()
    if (error.value.statusCode === 422) {
      toast.add({
        title: 'Login Error',
        description: error.value.data?.message ?? 'Invalid credentials.',
        color: 'error',
        icon: 'i-lucide-circle-x'
      })
    } else {
      toast.add({
        title: 'Unknown Error',
        description: 'An unexpected error occurred. Please try again.',
        color: 'error',
        icon: 'i-lucide-circle-x'
      })
    }
    return
  }

  await navigateTo('/profile')
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
