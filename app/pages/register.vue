<script setup lang="ts">
import { FetchError } from 'ofetch'

const state = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
})

async function handleRegister(): Promise<void> {
  const { $api } = useNuxtApp()

  try {
    await $api('/auth/register', {
      method: 'POST',
      body: { ...state }
    })

    await navigateTo('/profile')
  } catch (error) {
    if (error instanceof FetchError && error.status === 422) {
      const errors = error.data?.errors || {}
      for (const key in errors) {
        errors[key].forEach((message: string) => {
          alert(message)
        })
      }
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
          Create an account
        </h1>
      </template>

      <UForm
        :state="state"
        class="space-y-4"
        @submit="handleRegister"
      >
        <UFormField
          label="Name"
          name="name"
          required
        >
          <UInput v-model="state.name" />
        </UFormField>

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

        <UFormField
          label="Confirm Password"
          name="password_confirmation"
          required
        >
          <UInput
            v-model="state.password_confirmation"
            type="password"
          />
        </UFormField>

        <UButton
          type="submit"
          label="Register"
          block
        />
      </UForm>
    </UCard>
  </UContainer>
</template>
