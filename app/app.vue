<script setup>
import { navigateTo, useHead, useSeoMeta } from '#app'

import AppLogo from '~/components/AppLogo.vue'
import { useAuth } from '~/composables/useAuth'
import { useUser } from '~/composables/useUser'

const { isLoggedIn, user } = useUser()
const { logout } = useAuth()

const handleLogout = async () => {
  await logout()
  await navigateTo('/')
}

useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', href: '/favicon.ico' }],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'Nuxt Starter Template'
const description
  = 'A production-ready starter template powered by Nuxt UI. Build beautiful, accessible, and performant applications in minutes, not hours.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink to="/">
          <AppLogo class="w-auto h-6 shrink-0" />
        </NuxtLink>
      </template>

      <template #right>
        <template v-if="isLoggedIn">
          <span class="text-sm text-muted">
            {{ user?.email }}
          </span>

          <UButton
            color="neutral"
            variant="ghost"
            @click="handleLogout"
          >
            Logout
          </UButton>
        </template>

        <template v-else>
          <UButton
            to="/login"
            color="neutral"
            variant="ghost"
          >
            Login
          </UButton>

          <UButton
            to="/register"
            color="primary"
          >
            Register
          </UButton>
        </template>

        <UColorModeButton />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <USeparator icon="i-simple-icons-nuxtdotjs" />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          © {{ new Date().getFullYear() }}
        </p>
      </template>

      <template #right>
        <UButton
          to="https://github.com/nuxt-ui-templates/starter"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UFooter>
  </UApp>
</template>
