<script setup lang="ts">
import { definePageMeta } from '#imports'

import LoginForm from '~/components/LoginForm.vue'

definePageMeta({
  middleware: 'guest'
})
</script>

<template>
  <UContainer class="py-12">
    <UCard class="max-w-lg mx-auto">
      <template #header>
        <h1 class="text-xl font-bold text-center">
          Log in to your account
        </h1>
      </template>

      <LoginForm />
    </UCard>
  </UContainer>
</template>
