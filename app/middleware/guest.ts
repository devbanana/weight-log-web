import { defineNuxtRouteMiddleware, navigateTo } from '#app'

import { useUser } from '~/composables/useUser'

/**
 * Guest middleware - protects guest-only routes (login, register, etc.)
 * Redirects authenticated users to dashboard or intended destination
 */
export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn } = useUser()

  // Allow access if user is not logged in
  if (!isLoggedIn.value) {
    return
  }

  // If user is logged in, check for intended redirect first
  const redirectTo = to.query.redirect as string | undefined

  if (redirectTo && redirectTo !== to.path) {
    // Navigate to intended destination (from ?redirect query param)
    return navigateTo(redirectTo)
  }

  // Default redirect to dashboard
  return navigateTo('/', { replace: true })
})
