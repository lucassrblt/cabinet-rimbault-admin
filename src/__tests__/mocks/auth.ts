import { vi } from 'vitest'
import { NextResponse } from 'next/server'

// Types for authenticated/unauthenticated results
export interface AuthenticatedResult {
  authenticated: true
  session: {
    user: {
      id: string
      email: string
      name: string
    }
  }
}

export interface UnauthenticatedResult {
  authenticated: false
  response: NextResponse
}

export type AuthResult = AuthenticatedResult | UnauthenticatedResult

// Mock authenticated user session
export const mockAuthenticatedSession: AuthenticatedResult = {
  authenticated: true,
  session: {
    user: {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    },
  },
}

// Factory function to create a fresh unauthenticated response each time
function createUnauthenticatedResponse(): UnauthenticatedResult {
  return {
    authenticated: false,
    response: NextResponse.json(
      { error: 'Non autorisé. Veuillez vous connecter.' },
      { status: 401 }
    ),
  }
}

// Mock requireAuth function
export const mockRequireAuth = vi.fn<[], Promise<AuthResult>>()

// Mock the api-auth module
vi.mock('@/lib/api-auth', () => ({
  requireAuth: () => mockRequireAuth(),
}))

// Helper to set authenticated state
export function setAuthenticated(isAuthenticated: boolean) {
  if (isAuthenticated) {
    const session: AuthenticatedResult = {
      authenticated: true,
      session: {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
        },
      },
    }
    mockRequireAuth.mockResolvedValue(session)
  } else {
    // Create a new response each time to avoid "Body already read" error
    mockRequireAuth.mockImplementation(() => Promise.resolve(createUnauthenticatedResponse()))
  }
}

// Reset mocks
export function resetAuthMocks() {
  mockRequireAuth.mockReset()
}
