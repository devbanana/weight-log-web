import { vi } from 'vitest'

vi.mock('~/plugins/auth', () => ({ default: vi.fn() }))
