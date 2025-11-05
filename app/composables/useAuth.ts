import type { Ref } from 'vue'
import type { User } from '~/types/user'

import { useAPI } from '@/composables/useAPI'
import { useUser } from '@/composables/useUser'

interface AuthInfo {
  load: () => Promise<Ref<User | null>>
  logout: () => Promise<void>
}

export const useAuth = (): AuthInfo => {
  const { user, clearAuth } = useUser()

  const load = async (): Promise<Ref<User | null>> => {
    const { data, error } = await useAPI<User>('/api/user')

    if (error.value) {
      clearAuth()
    }

    if (data.value) {
      user.value = data.value
    }

    return user
  }

  const logout = async (): Promise<void> => {
    await useAPI('/auth/logout', {
      method: 'POST',
      // Convert undefined to null to prevent warning from useFetch
      transform: () => null
    })

    clearAuth()
  }

  return {
    load,
    logout
  }
}
