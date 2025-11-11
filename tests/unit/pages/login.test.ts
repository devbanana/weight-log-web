import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'

import LoginPage from '~/pages/login.vue'

// Mock the LoginForm component
vi.mock('~/components/LoginForm.vue', () => ({
  default: {
    template: '<div data-test="login-form">Login Form Component</div>'
  }
}))

describe('login.vue', () => {
  it('should show an h1 with the correct text', async () => {
    const wrapper = await mountSuspended(LoginPage)

    expect(wrapper.find('h1').text()).toBe('Log in to your account')
  })

  it('should render the login form', async () => {
    const wrapper = await mountSuspended(LoginPage)

    expect(wrapper.find('[data-test="login-form"]').exists()).toBe(true)
  })
})
