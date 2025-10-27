<script setup lang="ts">
const { $api } = useNuxtApp()
const { data: user, pending, error } = await useAsyncData('user', () => $api('/auth/user'))
</script>

<template>
  <UContainer class="py-12">
    <div v-if="pending">
      Loading profile...
    </div>
    <div v-else-if="error">
      Could not load profile. Please try again.
    </div>
    <UCard
      v-else-if="user"
      class="max-w-lg mx-auto"
    >
      <template #header>
        <h1 class="text-xl font-bold text-center">
          Profile
        </h1>
      </template>

      <div class="space-y-4">
        <p>
          <strong>Name:</strong> {{ user.name }}
        </p>
        <p>
          <strong>Email:</strong> {{ user.email }}
        </p>
      </div>
    </UCard>
  </UContainer>
</template>
