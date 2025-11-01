<script setup lang="ts">
const state = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
})

const { error, pending, execute } = await useAPI('/auth/register', {
  method: 'POST',
  body: () => ({ ...state }),
  immediate: false
})

const onRegister = async (): Promise<void> => {
  await execute()

  if (error.value) {
    if (error.value.status === 422 && error.value.data?.errors != undefined) {
      alert(JSON.stringify(error.value))
      for (const [, messages] of Object.entries(error.value.data.errors)) {
        messages.forEach((message: string) => {
          alert(message)
        })
      }
    } else {
      alert('An unexpected error occurred. Please try again.')
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
          Create an account
        </h1>
      </template>

      <UForm
        :state="state"
        class="space-y-4"
        @submit.prevent="onRegister"
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
          :disabled="pending"
          label="Register"
          block
        />
      </UForm>
    </UCard>
  </UContainer>
</template>
