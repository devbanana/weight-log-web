<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { useUser } from '~/composables/useUser'

const { error, pending } = useAuth().load()
const { user } = useUser()
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
        <p><strong>Name:</strong> {{ user.name }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
      </div>
    </UCard>
  </UContainer>
</template>
