<script setup lang="ts">
import { definePageMeta } from '#imports'

import LoginForm from '~/components/LoginForm.vue'

definePageMeta({
  middleware: 'guest'
})
</script>

<template>
  <UContainer class="py-12">
    <UPageCard
      class="w-full max-w-md"
      description="Sign in to track your weight and view your progress."
    >
      <template #title>
        <h1>Login</h1>
      </template>
      <LoginForm />
    </UPageCard>
  </UContainer>
</template>
