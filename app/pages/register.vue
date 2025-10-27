<script setup lang="ts">
const state = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
})

async function handleRegister() {
  const { $api } = useNuxtApp()

  try {
    await $api('/auth/register', {
      method: 'POST',
      body: {
        name: state.name,
        email: state.email,
        password: state.password,
        password_confirmation: state.password_confirmation
      }
    })

    // NOTE: Laravel Fortify may redirect on successful registration.
    // If you are building an SPA, you might need to configure Fortify
    // to return a JSON response instead of a redirect.
    // After a successful registration, you may want to navigate the user
    // to the login page or dashboard.
    // Example: await navigateTo('/dashboard')
    alert('Registration successful!')
  } catch (err) {
    // TODO: Handle validation errors from Fortify, for example, by using the `errors` prop on UFormGroup.
    console.error(err)
    alert('Registration failed.')
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
