import type { UseFetchOptions } from '#app'

import { useFetch, useNuxtApp } from '#app'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import { useAPI } from '~/composables/useAPI'

// Mock Nuxt composables
vi.mock('#app', async (importOriginal) => {
  const actual = await importOriginal<typeof import('#app')>()

  return {
    ...actual,
    useFetch: vi.fn(),
    useNuxtApp: vi.fn()
  }
})

describe('useAPI', () => {
  const mockApi = vi.fn()
  const mockUseFetchReturn = {
    data: ref(null),
    pending: ref(false),
    error: ref(null),
    status: ref('idle' as const),
    execute: vi.fn(),
    refresh: vi.fn(),
    clear: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useNuxtApp).mockReturnValue({
      $api: mockApi
    } as unknown as ReturnType<typeof useNuxtApp>)

    vi.mocked(useFetch).mockReturnValue(mockUseFetchReturn as never)
  })

  it('should call useFetch with custom $api instance', () => {
    void useAPI('/api/test')

    expect(useFetch).toHaveBeenCalled()
    const callArgs = vi.mocked(useFetch).mock.lastCall
    if (!callArgs) {
      throw new Error('Expected useFetch to be called')
    }

    expect(callArgs[1]).toHaveProperty('$fetch', mockApi)
  })

  it('should pass through string URL', () => {
    void useAPI('/api/string')

    const callArgs = vi.mocked(useFetch).mock.lastCall
    if (!callArgs) {
      throw new Error('Expected useFetch to be called')
    }

    expect(callArgs[0]).toBe('/api/string')
  })

  it('should pass through Ref URL', () => {
    const refUrl = ref('/api/ref')
    void useAPI(refUrl)

    const callArgs = vi.mocked(useFetch).mock.lastCall
    if (!callArgs) {
      throw new Error('Expected useFetch to be called')
    }

    expect(callArgs[0]).toBe(refUrl)
  })

  it('should pass through function URL', () => {
    const createFunctionUrl = vi.fn(() => '/api/function')

    void useAPI(createFunctionUrl)

    const callArgs = vi.mocked(useFetch).mock.lastCall
    if (!callArgs) {
      throw new Error('Expected useFetch to be called')
    }

    expect(callArgs[0]).toBe(createFunctionUrl)
    expect(createFunctionUrl).not.toHaveBeenCalled()
  })

  it('should pass through all options to useFetch', () => {
    const options: UseFetchOptions<unknown> = {
      method: 'POST',
      body: { test: 'data' },
      headers: { 'X-Custom': 'value' },
      query: { page: 1 },
      immediate: false
    }

    void useAPI('/api/test', options)

    const callArgs = vi.mocked(useFetch).mock.lastCall
    if (!callArgs) {
      throw new Error('Expected useFetch to be called')
    }

    expect(callArgs[1]).toMatchObject({
      ...options,
      $fetch: mockApi
    })
  })

  it('should override $fetch even if provided in options', () => {
    const customFetch = vi.fn()

    void useAPI('/api/test', { $fetch: customFetch as never })

    const callArgs = vi.mocked(useFetch).mock.lastCall
    if (!callArgs?.[1]) {
      throw new Error('Expected useFetch to be called')
    }

    expect(callArgs[1].$fetch).toBe(mockApi)
    expect(callArgs[1].$fetch).not.toBe(customFetch)
  })

  it('returns the exact AsyncData returned by useFetch', () => {
    const result = useAPI('/api/test')

    expect(result).toBe(mockUseFetchReturn)
  })
})
