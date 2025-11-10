import type { User } from '~/types/user'

import { beforeEach, describe, expect, it, test } from 'vitest'

import { useUser } from './useUser'

describe('useUser', () => {
  beforeEach(() => {
    // Clear user state between tests
    const { clearAuth } = useUser()
    clearAuth()
  })

  it('should initialize with null user', () => {
    const { user } = useUser()

    expect(user.value).toBeNull()
  })

  it('should initialize with isLoggedIn as false', () => {
    const { isLoggedIn } = useUser()

    expect(isLoggedIn.value).toBe(false)
  })

  it('should return isLoggedIn as true when user is set', () => {
    const { user, isLoggedIn } = useUser()

    const mockUser: User = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com'
    }

    user.value = mockUser

    expect(isLoggedIn.value).toBe(true)
  })

  it('should clear user state when clearAuth is called', () => {
    const { user, clearAuth } = useUser()

    const mockUser: User = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com'
    }

    user.value = mockUser
    expect(user.value).not.toBeNull()

    clearAuth()

    expect(user.value).toBeNull()
  })

  it('should share state across multiple calls', () => {
    const instance1 = useUser()
    const instance2 = useUser()

    const mockUser: User = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com'
    }

    instance1.user.value = mockUser

    // Both instances should reference the same state
    expect(instance2.user.value).toEqual(mockUser)
    expect(instance2.isLoggedIn.value).toBe(true)
  })

  it('should reactively update isLoggedIn when user changes', () => {
    const { user, isLoggedIn } = useUser()

    expect(isLoggedIn.value).toBe(false)

    const mockUser: User = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com'
    }

    user.value = mockUser
    expect(isLoggedIn.value).toBe(true)

    user.value = null
    expect(isLoggedIn.value).toBe(false)
  })

  it('should clear isLoggedIn when clearAuth is called', () => {
    const { user, isLoggedIn, clearAuth } = useUser()

    const mockUser: User = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com'
    }

    user.value = mockUser
    expect(isLoggedIn.value).toBe(true)

    clearAuth()

    expect(isLoggedIn.value).toBe(false)
  })
})
