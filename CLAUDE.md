# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Nuxt 4 web application for weight logging, built with TypeScript, Vue 3, and Nuxt UI. The frontend integrates with a Laravel backend using Sanctum cookie-based authentication.

**Key Technologies:**

- Nuxt 4.1.3 with TypeScript (strict mode)
- @nuxt/ui 4.0.1 (Tailwind-based component library)
- Laravel Sanctum integration (cookie-based session auth)
- npm as package manager

## Development Commands

```bash
npm run dev          # Start dev server at weight-log.test:3000
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Check linting
npm run lint:fix     # Auto-fix linting issues
npm run format       # Check formatting
npm run format:fix   # Auto-format with Prettier
npm run typecheck    # Run TypeScript type checking
```

**CI/CD:** GitHub Actions runs `lint` + `typecheck` on every push (Node 22, Ubuntu).

## Critical Architecture Patterns

### Auto-Imports Are Disabled

**This codebase explicitly disables Nuxt's auto-import magic** (`imports.autoImport: false` and `components.dirs: []`). All imports must be explicit:

```typescript
// ✅ Correct
import { useHead, useSeoMeta } from '#app'
import { useAuth } from '~/composables/useAuth'

// ❌ Will fail - auto-imports disabled
const { user } = useUser() // Error: useUser is not defined
```

**Exception:** Compiler macros like `definePageMeta` may be imported from `#imports` since they're build-time transformations rather than runtime functions:

```typescript
// ✅ Allowed for compiler macros
import { definePageMeta } from '#imports'

definePageMeta({
  middleware: 'auth'
})
```

This design choice prioritizes explicitness and makes dependencies clear.

### Laravel Sanctum Cookie-Based Authentication

The authentication system uses **cookie-based sessions**, not bearer tokens. Understanding this flow is critical:

#### Plugin Execution Order (on app init):

1. **`app/plugins/api.ts`**: Creates custom `$fetch` instance with CSRF handling
2. **`app/plugins/auth.ts`**: Loads current user via `useAuth().load()`

#### Authentication Flow:

**CSRF Protection:**

- Before any POST/PUT/PATCH/DELETE request, the API plugin automatically:
  1. Checks for `XSRF-TOKEN` cookie
  2. If missing, fetches from `/sanctum/csrf-cookie`
  3. Adds `X-XSRF-TOKEN` header to request
- **Never manually add CSRF headers** - the plugin handles this

**Server-Side Rendering:**

- On server: `forwardRequestHeaders()` copies `Origin` and `Cookie` from original request
- **Critical:** Must call `forwardRequestHeaders()` BEFORE CSRF setup to avoid composable errors
- On client: Uses `credentials: 'include'` to send cookies

**Global User State:**

```typescript
// Global state via Nuxt's useState (not Pinia/Vuex)
const user = useState<User | null>('user', () => null)
const isLoggedIn = computed(() => !!user.value)
```

**Logout Resilience:**

```typescript
// Always clears auth in finally block, even if API call fails
try {
  await useAPI('/auth/logout', { method: 'POST' })
} finally {
  clearAuth() // Ensures local state is always cleared
}
```

**Error Handling:**

- 401 → Auto-clears auth state (in `api.ts` plugin)
- 419 → CSRF mismatch warning
- 422 → Validation errors (show via toast)

### API Call Layering

Three-layer system for API calls:

1. **`$fetch` instance** (`app/plugins/api.ts`):

   - Custom fetch with CSRF, auth, error handling
   - Base URL from `NUXT_PUBLIC_API_BASE` env var
   - Provided globally as `$api`

2. **`useAPI` composable** (`app/composables/useAPI.ts`):

   - Wrapper around `useFetch` using custom `$api`
   - Returns reactive state (pending, error, data)
   - Fully typed with TypeScript generics

3. **Domain composables** (`useAuth`, `useUser`):
   - Business logic layer
   - Use `useAPI` internally

**Always use `useAPI` for API calls**, never direct `$fetch` or `useFetch`:

```typescript
// ✅ Correct
const response = useAPI<User>('/api/user')

// ❌ Don't do this
const response = await $fetch('/api/user')
```

### Form Handling Pattern

Forms use reactive state objects (not v-model on individual fields):

```typescript
const state = reactive({
  email: '',
  password: ''
})

// Use computed for reactive request bodies
const { error } = useAPI('/auth/login', {
  method: 'POST',
  body: computed(() => state), // Reactive body
  immediate: false
})
```

Toast notifications via `useToast()` for user feedback.

## Expected Backend Endpoints

Laravel backend with these endpoints:

- `GET /sanctum/csrf-cookie` - Initialize CSRF token
- `POST /auth/login` - Email/password login
- `POST /auth/register` - User registration
- `POST /auth/logout` - Logout
- `GET /api/user` - Get authenticated user

Backend must have CORS configured to allow credentials and same-site cookies.

## Code Style & Conventions

**TypeScript:**

- Strict mode enabled
- Explicit return types required (`@typescript-eslint/explicit-function-return-type`)
- `noImplicitAny`, `strictNullChecks` enabled

**ESLint:**

- Perfectionist plugin enforces sorted imports (types, external, internal)
- No `console.log` (only `warn`/`error` allowed)
- Imports from `#imports` allowed only for compiler macros (e.g., `definePageMeta`)

**Prettier:**

- No semicolons
- Single quotes
- No trailing commas
- 80 char line width

**Before committing:** Run `npm run format:fix && npm run lint:fix`

## Folder Structure

```
app/
├── app.vue              # Root layout (header, footer, <NuxtPage />)
├── components/          # Vue components (manual imports only)
├── composables/         # Reusable composition functions
│   ├── useAPI.ts       # API wrapper around useFetch
│   ├── useAuth.ts      # Auth logic (login, logout, load)
│   └── useUser.ts      # Global user state management
├── middleware/          # Route middleware
│   ├── auth.ts         # Protects authenticated routes
│   └── guest.ts        # Protects guest-only routes (login/register)
├── pages/               # File-based routing
├── plugins/             # Auto-loaded plugins
│   ├── api.ts          # $fetch instance + CSRF handling
│   └── auth.ts         # Initial user load
└── types/               # TypeScript definitions
```

## Common Patterns & Gotchas

**Authentication:**

- Route protection via `auth` and `guest` middleware (use `definePageMeta`)
- User state is global via `useState('user')` - don't create duplicate state
- Auth plugin loads user on app init - don't call `load()` in pages

**API Calls:**

- CSRF is auto-handled - never manually add `X-XSRF-TOKEN` header
- Use `computed(() => state)` for reactive request bodies
- `useAPI` supports all `useFetch` options (immediate, transform, etc.)

**Components:**

- Must manually import components (no auto-registration)
- Nuxt UI components like `UButton`, `UForm` available via framework

**Environment:**

- `NUXT_PUBLIC_API_BASE` - Backend API URL (e.g., `http://localhost`)
- Dev server runs on `weight-log.test` (likely Herd/Valet setup)

## Architecture Philosophy

This codebase prioritizes **explicitness over magic** and **type safety over convenience**:

- Explicit imports make dependencies clear
- Strict TypeScript catches errors early
- Cookie-based auth is more secure than bearer tokens
- Centralized error handling in API plugin
- No state management library needed (useState is sufficient)

The trade-off is more verbose code, but it's highly maintainable and easy to understand.
