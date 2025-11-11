import type { User } from '~/types/user'

import { navigateTo, useNuxtApp, useRoute } from '#app'

import { useUser } from '~/composables/useUser'

interface AuthInfo {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
}

interface LoginCredentials {
  email: string
  password: string
}

export const useAuth = (): AuthInfo => {
  const { user, clearAuth } = useUser()

  const login = async (credentials: LoginCredentials): Promise<void> => {
    const { isLoggedIn } = useUser()
    const currentRoute = useRoute()
    const { $api } = useNuxtApp()

    let redirectPath = '/'
    if (currentRoute.query.redirect) {
      redirectPath = currentRoute.query.redirect as string
    }

    if (isLoggedIn.value) {
      await navigateTo(redirectPath)
      return
    }

    await $api('/auth/login', {
      method: 'POST',
      body: credentials
    })

    // Fetch user data after successful login
    const userData = await $api<User>('/api/user')
    user.value = userData

    await navigateTo(redirectPath)
  }

  const logout = async (): Promise<void> => {
    const { $api } = useNuxtApp()

    try {
      await $api('/auth/logout', {
        method: 'POST'
      })
    } finally {
      clearAuth()
      await navigateTo('/')
    }
  }

  return {
    login,
    logout
  }
}
