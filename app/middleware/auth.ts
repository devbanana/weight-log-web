import { defineNuxtRouteMiddleware, navigateTo } from '#app'

import { useUser } from '~/composables/useUser'

/**
 * Auth middleware - protects authenticated routes
 * Redirects unauthenticated users to login page with intended redirect
 */
export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn } = useUser()

  // Allow access if user is logged in
  if (isLoggedIn.value) {
    return
  }

  // Redirect to login with intended destination as query parameter
  return navigateTo(
    {
      path: '/login',
      query: { redirect: to.fullPath }
    },
    { replace: true }
  )
})
