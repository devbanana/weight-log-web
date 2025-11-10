# Testing Guide

This project uses Vitest with @nuxt/test-utils for testing.

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (reruns on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests are located next to the files they test:

```
app/
├── composables/
│   ├── useAuth.ts
│   ├── useAuth.test.ts    # Tests for useAuth
│   ├── useUser.ts
│   └── useUser.test.ts    # Tests for useUser
```

## Writing Tests

### Basic Test Structure

```typescript
import { beforeEach, describe, expect, it } from 'vitest'

describe('MyComposable', () => {
  beforeEach(() => {
    // Setup code that runs before each test
  })

  it('should do something', () => {
    // Arrange: Set up test data
    // Act: Execute the code being tested
    // Assert: Verify the results
    expect(result).toBe(expected)
  })
})
```

### Testing Composables

Composables can be tested directly since they're just functions:

```typescript
import { useUser } from './useUser'

it('should set user state', () => {
  const { user } = useUser()
  user.value = { id: '1', name: 'Test', email: 'test@example.com' }
  expect(user.value).not.toBeNull()
})
```

### Mocking Nuxt Composables

When testing code that uses Nuxt composables like `useNuxtApp` or `navigateTo`,
use partial mocking:

```typescript
import { navigateTo, useNuxtApp } from '#app'
import { vi } from 'vitest'

vi.mock('#app', async (importOriginal) => {
  const actual = await importOriginal<typeof import('#app')>()
  return {
    ...actual,
    navigateTo: vi.fn(),
    useNuxtApp: vi.fn()
  }
})
```

### Mocking API Calls

Mock the `$api` instance returned by `useNuxtApp`:

```typescript
const mockApi = vi.fn()

vi.mocked(useNuxtApp).mockReturnValue({
  $api: mockApi
} as ReturnType<typeof useNuxtApp>)

// In test:
mockApi.mockResolvedValueOnce({ id: '1', name: 'Test' })
```

## Coverage Reports

After running `npm run test:coverage`, coverage reports are generated in:

- Text format: In the terminal
- HTML format: `coverage/index.html` (open in browser for detailed view)
- JSON format: `coverage/coverage-final.json`

The `coverage/` directory is git-ignored.

## Current Test Coverage

- **useUser**: 100% coverage - Tests state management, computed properties, and
  state clearing
- **useAuth**: 100% coverage - Tests login/logout flows, navigation, error
  handling, and edge cases

## Future Testing Opportunities

Consider adding tests for:

- **Middleware** (`auth.ts`, `guest.ts`) - Test redirect logic
- **Components** (`AppLogo.vue`) - Test rendering and props
- **Plugins** (`api.ts`) - Test CSRF handling and error interceptors
- **Pages** - Test form validation and user interactions
