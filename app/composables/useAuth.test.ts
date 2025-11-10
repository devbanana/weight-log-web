import type { User } from '~/types/user'

import { navigateTo, useNuxtApp, useRoute } from '#app'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuth } from './useAuth'
import { useUser } from './useUser'

// Mock Nuxt composables
vi.mock('#app', async (importOriginal) => {
  const actual = await importOriginal<typeof import('#app')>()

  return {
    ...actual,
    navigateTo: vi.fn(),
    useNuxtApp: vi.fn(),
    useRoute: vi.fn()
  }
})

describe('useAuth', () => {
  const mockApi = vi.fn()
  const mockUser: User = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com'
  }

  beforeEach(() => {
    // Clear user state
    const { clearAuth } = useUser()
    clearAuth()

    // Reset all mocks
    vi.clearAllMocks()

    // Setup default mock implementations
    vi.mocked(useNuxtApp).mockReturnValue({
      $api: mockApi
    } as unknown as ReturnType<typeof useNuxtApp>)

    vi.mocked(useRoute).mockReturnValue({
      query: {}
    } as ReturnType<typeof useRoute>)

    vi.mocked(navigateTo).mockResolvedValue()
  })

  describe('login', () => {
    it('should successfully login and set user', async () => {
      mockApi
        .mockResolvedValueOnce(undefined) // /auth/login response
        .mockResolvedValueOnce(mockUser) // /api/user response

      const { login } = useAuth()
      const { user, isLoggedIn } = useUser()

      await login({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(mockApi).toHaveBeenCalledWith('/auth/login', {
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'password123'
        }
      })

      expect(mockApi).toHaveBeenCalledWith('/api/user')
      expect(user.value).toEqual(mockUser)
      expect(isLoggedIn.value).toBe(true)
    })

    it('should navigate to home after successful login', async () => {
      mockApi.mockResolvedValueOnce(undefined).mockResolvedValueOnce(mockUser)

      const { login } = useAuth()

      await login({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(navigateTo).toHaveBeenCalledWith('/')
    })

    it('should navigate to redirect path if provided in query', async () => {
      vi.mocked(useRoute).mockReturnValue({
        query: { redirect: '/dashboard' }
      } as unknown as ReturnType<typeof useRoute>)

      mockApi.mockResolvedValueOnce(undefined).mockResolvedValueOnce(mockUser)

      const { login } = useAuth()

      await login({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(navigateTo).toHaveBeenCalledWith('/dashboard')
    })

    it('should navigate immediately if already logged in', async () => {
      const { user } = useUser()
      user.value = mockUser

      const { login } = useAuth()

      await login({
        email: 'test@example.com',
        password: 'password123'
      })

      // Should navigate without calling API
      expect(mockApi).not.toHaveBeenCalled()
      expect(navigateTo).toHaveBeenCalledWith('/')
    })

    it('should handle login errors', async () => {
      const loginError = new Error('Invalid credentials')
      mockApi.mockRejectedValueOnce(loginError)

      const { login } = useAuth()
      const { user } = useUser()

      await expect(
        login({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
      ).rejects.toThrow('Invalid credentials')

      // User should remain null on failed login
      expect(user.value).toBeNull()
    })
  })

  describe('logout', () => {
    it('should successfully logout and clear user', async () => {
      // Set up logged-in state
      const { user } = useUser()
      user.value = mockUser

      mockApi.mockResolvedValueOnce(undefined)

      const { logout } = useAuth()

      await logout()

      expect(mockApi).toHaveBeenCalledWith('/auth/logout', {
        method: 'POST'
      })

      expect(user.value).toBeNull()
      expect(navigateTo).toHaveBeenCalledWith('/')
    })

    it('should clear user state even if API call fails', async () => {
      // Set up logged-in state
      const { user } = useUser()
      user.value = mockUser

      mockApi.mockRejectedValueOnce(new Error('Network error'))

      const { logout } = useAuth()

      // Logout will throw, but finally block should still clear auth
      try {
        await logout()
      } catch {
        // Expected to throw, but we still want to verify cleanup happened
      }

      // User should still be cleared despite API error
      expect(user.value).toBeNull()
      expect(navigateTo).toHaveBeenCalledWith('/')
    })

    it('should navigate to home after logout', async () => {
      const { user } = useUser()
      user.value = mockUser

      mockApi.mockResolvedValueOnce(undefined)

      const { logout } = useAuth()

      await logout()

      expect(navigateTo).toHaveBeenCalledWith('/')
    })
  })
})
