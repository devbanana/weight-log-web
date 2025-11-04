import type { CookieRef } from '#app'

import {
  defineNuxtPlugin,
  useCookie,
  useRequestHeaders,
  useRequestURL,
  useRuntimeConfig
} from '#app'

import { useAuth } from '~/composables/useAuth'

/**
 * Determines the credentials mode for API requests based on the execution environment.
 *
 * This function returns 'include' when running on the client-side to ensure that
 * credentials (such as cookies) are sent with cross-origin API requests. On the
 * server-side, it returns undefined, as credentials are not typically needed.
 * @returns {RequestCredentials | undefined} 'include' if on the client, otherwise undefined.
 */
const getCredentialsMode = (): RequestCredentials | undefined =>
  import.meta.client ? 'include' : undefined

/**
 * Retrieves the CSRF token from the cookies.
 * @returns {CookieRef<string | null | undefined>} A reference to the CSRF token cookie.
 */
const getCsrfToken = (): CookieRef<string | null | undefined> =>
  useCookie('XSRF-TOKEN', { readonly: true })

/**
 * Forwards necessary headers from the incoming request to the outgoing API request.
 *
 * This function is intended for use on the server-side (`import.meta.server`). It
 * copies the 'Origin' and 'Cookie' headers from the original client request to
 * ensure that server-side API calls are made with the correct context, which is
 * essential for authentication and CORS policies.
 * @param {Headers} headers The Headers object of the outgoing API request to which the headers will be added.
 */
const forwardRequestHeaders = (headers: Headers): void => {
  headers.set('Origin', useRequestURL().origin)
  const cookies = useRequestHeaders(['cookie'])
  if (cookies.cookie) {
    headers.set('Cookie', cookies.cookie)
  }
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase

  /**
   * Fetches the CSRF cookie from the Laravel Sanctum endpoint.
   *
   * This function makes a request to `/sanctum/csrf-cookie` to initialize
   * CSRF protection and receive the `XSRF-TOKEN` cookie from the server.
   * This is a prerequisite for making state-changing requests to the API.
   * @returns {Promise<CookieRef<string | null | undefined>>} A promise that resolves to the CSRF token cookie reference.
   */
  const fetchCsrfCookie = async (): Promise<
    CookieRef<string | null | undefined>
  > => {
    await $fetch('/sanctum/csrf-cookie', {
      baseURL,
      credentials: 'include'
    })

    return getCsrfToken()
  }

  /**
   * Ensures the CSRF token is available and sets it on the request headers.
   *
   * This function first checks for the presence of the `XSRF-TOKEN` cookie. If the
   * cookie is not found, it attempts to fetch it by calling `fetchCsrfCookie`.
   * After ensuring the token is available, it adds the token to the provided
   * headers object under the `X-XSRF-TOKEN` key.
   * @param {Headers} headers The Headers object for the outgoing request.
   * @throws {Error} If the CSRF token cannot be found after attempting to fetch it.
   * @returns {Promise<void>} A promise that resolves when the header has been set.
   */
  const setCsrfHeader = async (headers: Headers): Promise<void> => {
    let csrfToken = getCsrfToken()

    if (!csrfToken.value) {
      csrfToken = await fetchCsrfCookie()
    }

    if (!csrfToken.value) {
      throw new Error(
        'CSRF token not found in cookies after fetching CSRF cookie.'
      )
    }

    headers.set('X-XSRF-TOKEN', csrfToken.value)
  }

  const api = $fetch.create({
    baseURL,
    credentials: getCredentialsMode(),
    redirect: 'manual',
    headers: {
      Accept: 'application/json'
    },
    async onRequest({ options }): Promise<void> {
      const securedMethods = ['POST', 'PUT', 'PATCH', 'DELETE']
      if (
        options.method
        && securedMethods.includes(options.method.toUpperCase())
      ) {
        await setCsrfHeader(options.headers)
      }

      if (import.meta.server) {
        forwardRequestHeaders(options.headers)
      }
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        useAuth().logout()
      } else if (response.status === 419) {
        console.warn('CSRF token mismatch or expired.')
      }
    }
  })

  return {
    provide: {
      api
    }
  }
})
