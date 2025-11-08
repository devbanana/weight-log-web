<script setup lang="ts">
import { navigateTo } from '#app'
import { definePageMeta } from '#imports'

import { useAuth } from '@/composables/useAuth'

definePageMeta({
  middleware: 'auth'
})

await useAuth().logout()

await navigateTo('/')
</script>

<template>
  <UContainer class="py-12">
    <p class="text-center">
      Logging out...
    </p>
  </UContainer>
</template>
