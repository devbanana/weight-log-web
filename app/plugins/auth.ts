import type { User } from '~/types/user'

import { defineNuxtPlugin } from '#app'

import { useAPI } from '@/composables/useAPI'
import { useUser } from '@/composables/useUser'

export default defineNuxtPlugin(async () => {
  const { user } = useUser()

  await useAPI<User>('/api/user', {
    transform: (data) => {
      user.value = data
      return data
    }
  })
})
