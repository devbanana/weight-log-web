<script setup lang="ts">
import { useUser } from '~/composables/useUser'

const { user } = useUser()
</script>

<template>
  <UContainer class="py-12">
    <UCard
      v-if="user"
      class="max-w-lg mx-auto"
    >
      <template #header>
        <h1 class="text-xl font-bold text-center">
          Profile
        </h1>
      </template>

      <div class="space-y-4">
        <p><strong>Name:</strong> {{ user.name }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
      </div>
    </UCard>
  </UContainer>
</template>
