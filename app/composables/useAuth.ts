import type { AsyncData } from '#app'
import type { ApiError } from '~/types/api-error'
import type { AsyncResponseStatus } from '~/types/async-response-status'
import type { User } from '~/types/user'

import { useAPI } from '@/composables/useAPI'
import { useUser } from '@/composables/useUser'

interface AuthInfo {
  load: () => AsyncResponseStatus<User | undefined, ApiError | undefined>
  logout: () => Promise<void>
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

  const logout = (): void => {
    void useAPI('/auth/logout', {
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
