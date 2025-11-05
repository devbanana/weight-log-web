<script setup lang="ts">
import { navigateTo } from '#app'

import { useAuth } from '@/composables/useAuth'

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
