<script setup lang="ts">
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
