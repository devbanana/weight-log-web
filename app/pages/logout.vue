<script setup lang="ts">
import { navigateTo } from '#app'

import { useAPI } from '~/composables/useAPI'

await useAPI('/auth/logout', { method: 'POST' })

await navigateTo('/')
</script>

<template>
  <UContainer class="py-12">
    <p class="text-center">
      Logging out...
    </p>
  </UContainer>
</template>
