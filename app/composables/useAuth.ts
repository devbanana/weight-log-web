import type { Ref } from 'vue'
import type { User } from '~/types/user'

import { useAPI } from '@/composables/useAPI'
import { useUser } from '@/composables/useUser'

const load = async (): Promise<Ref<User | null> | null> => {
  const { user, clearAuth } = useUser()
  const { data, error } = await useAPI<User>('/api/user')

  if (error.value) {
    console.log(error.value)
    clearAuth()
  }

  if (data.value) {
    console.log(data.value)
    user.value = data.value
  }

  return user
}

export const useAuth = (): { load: () => Promise<Ref<User | null> | null> } => {
  return {
    load
  }
}
