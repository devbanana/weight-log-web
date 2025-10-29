<script setup lang="ts">
import { FetchError } from 'ofetch'

const state = reactive({
  email: '',
  password: ''
})

async function handleLogin() {
  const { $api } = useNuxtApp()

  try {
    await $api('/auth/login', {
      method: 'POST',
      body: { ...state }
    })

    await navigateTo('/profile')
  } catch (error) {
    if (error instanceof FetchError && error.status === 422) {
      alert(error.data?.message || 'Invalid credentials.')
    } else {
      alert('An unexpected error occurred. Please try again.')
    }
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
        @submit="handleLogin"
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
          label="Login"
          block
        />
      </UForm>
    </UCard>
  </UContainer>
</template>
