import type { ComputedRef, Ref } from 'vue'
import type { User } from '~/types/user'

import { useState } from '#app'
import { computed } from 'vue'

/**
 * Represents the authentication state of the application.
 */
interface AuthInfo {
  /**
   * The currently authenticated user, or null if not logged in.
   */
  user: Ref<User | null>
  /**
   * A computed property that is true if the user is logged in.
   */
  isLoggedIn: ComputedRef<boolean>
}

/**
 * A composable for managing user authentication state.
 * @returns {AuthInfo} An object containing the authentication state.
 */
export const useAuth = (): AuthInfo => {
  const user = useState<User | null>('user', () => null)
  const isLoggedIn = computed(() => !!user.value)

  return {
    user,
    isLoggedIn
  }
}
