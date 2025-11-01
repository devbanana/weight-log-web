<script setup lang="ts">
const state = reactive({
  email: '',
  password: ''
})

const { data, error, pending, execute } = await useAPI('/auth/login', {
  method: 'POST',
  body: computed(() => ({ ...state })),
  immediate: false
})

async function handleLogin(): Promise<void> {
  await execute()

  if (error.value) {
    if (error.value.statusCode === 422) {
      alert(error.value.data?.message ?? 'Invalid credentials.')
    } else {
      alert('An unexpected error occurred. Please try again.')
    }
    return
  }

  alert(JSON.stringify(data.value))
  alert(JSON.stringify(error.value))

  // await navigateTo('/profile')
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
          :disabled="pending"
          label="Login"
          block
        />
      </UForm>
    </UCard>
  </UContainer>
</template>
