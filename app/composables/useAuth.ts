import type { AsyncData } from '#app'
import type { ApiError } from '~/types/api-error'
import type { AsyncResponseStatus } from '~/types/async-response-status'
import type { User } from '~/types/user'

import { navigateTo, useRoute } from '#app'

import { useAPI } from '@/composables/useAPI'
import { useUser } from '@/composables/useUser'

interface AuthInfo {
  load: () => AsyncResponseStatus<User | undefined, ApiError | undefined>
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
}

interface LoginCredentials {
  email: string
  password: string
}

const toAsyncResponseStatus = <DataT = unknown, ErrorT = unknown>(
  data: AsyncData<DataT, ErrorT>
): AsyncResponseStatus<DataT, ErrorT> => {
  const asyncResponse = {
    error: data.error,
    pending: data.pending,
    status: data.status,
    refresh: data.refresh,
    execute: data.execute,
    clear: data.clear
  }

  const promise = data.then(() => asyncResponse)
  return Object.assign(promise, asyncResponse)
}

export const useAuth = (): AuthInfo => {
  const { user, clearAuth } = useUser()

  const load = (): AsyncResponseStatus<
    User | undefined,
    ApiError | undefined
  > => {
    const response = useAPI<User>('/api/user', {
      transform: (data) => {
        user.value = data
        return data
      }
    })

    return toAsyncResponseStatus(response)
  }

  const login = async (credentials: LoginCredentials): Promise<void> => {
    const { isLoggedIn } = useUser()
    const currentRoute = useRoute()

    let redirectPath = '/'
    if (currentRoute.query.redirect) {
      redirectPath = currentRoute.query.redirect as string
    }

    if (isLoggedIn.value) {
      await navigateTo(redirectPath)
      return
    }

    const { error } = await useAPI('/auth/login', {
      method: 'POST',
      body: credentials
    })

    if (error.value) {
      throw error.value
    }

    await load().execute()
    await navigateTo(redirectPath)
  }

  const logout = async (): Promise<void> => {
    try {
      await useAPI('/auth/logout', {
        method: 'POST',
        // Convert undefined to null to prevent warning from useFetch
        transform: () => null
      })
    } finally {
      clearAuth()
      await navigateTo('/')
    }
  }

  return {
    load,
    login,
    logout
  }
}
