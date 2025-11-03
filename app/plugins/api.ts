import { defineNuxtPlugin, useCookie, useRequestHeaders, useRequestURL, useRuntimeConfig } from '#app'

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase

  await $fetch('/sanctum/csrf-cookie', {
    baseURL,
    credentials: 'include'
  })

  const api = $fetch.create({
    baseURL,
    credentials: 'include',
    redirect: 'manual',
    headers: {
      Accept: 'application/json'
    },
    onRequest({ options }) {
      const xsrfToken = useCookie('XSRF-TOKEN')

      if (xsrfToken.value) {
        options.headers.set('X-XSRF-TOKEN', xsrfToken.value)
      }

      if (import.meta.server) {
        options.headers.set('Origin', useRequestURL().origin)
        const cookies = useRequestHeaders(['cookie'])
        if (cookies.cookie) {
          options.headers.set('Cookie', cookies.cookie)
        }
      }
    }
  })

  return {
    provide: {
      api
    }
  }
})
