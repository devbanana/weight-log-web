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
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/json'
    },
    onRequest({ options }) {
      const xsrfToken = useCookie('XSRF-TOKEN')

      if (xsrfToken.value) {
        options.headers.set('X-XSRF-TOKEN', xsrfToken.value)
      }
    }
  })

  return {
    provide: {
      api
    }
  }
})
