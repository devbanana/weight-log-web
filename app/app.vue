<script setup lang="ts">
import { useHead, useSeoMeta } from '#app'

import AppLogo from '~/components/AppLogo.vue'
import { useAuth } from '~/composables/useAuth'
import { useUser } from '~/composables/useUser'

const { isLoggedIn, user } = useUser()
const { logout } = useAuth()

useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', href: '/favicon.ico' }],
  htmlAttrs: {
    lang: 'en'
  }
})

const description
  = 'Smart weight and calorie tracking powered by statistics. See trends, analyze progress, and achieve your goals whether losing, gaining, or maintaining weight.'

useSeoMeta({
  titleTemplate: page => (page ? `${page} - Weight Log` : 'Weight Log'),
  description,
  ogSiteName: 'Weight Log'
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
            @click="logout"
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
