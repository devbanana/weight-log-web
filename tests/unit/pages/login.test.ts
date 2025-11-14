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
  it('should show an h1 containing "Login"', async () => {
    const wrapper = await mountSuspended(LoginPage)

    const h1 = wrapper.find('h1')
    expect(h1.exists()).toBe(true)
    expect(h1.text()).toContain('Login')
  })

  it('should display the page description', async () => {
    const wrapper = await mountSuspended(LoginPage)

    expect(wrapper.text()).toContain(
      'Sign in to track your weight and view your progress.'
    )
  })

  it('should render the login form', async () => {
    const wrapper = await mountSuspended(LoginPage)

    expect(wrapper.find('[data-test="login-form"]').exists()).toBe(true)
  })
})
