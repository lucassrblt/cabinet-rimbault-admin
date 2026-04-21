import { vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

// Controls whether the public API auth passes
let isAuthorized = true

export function setPublicApiAuth(authorized: boolean) {
  isAuthorized = authorized
}

export function resetPublicApiAuthMocks() {
  isAuthorized = true
}

// Mock the api-public-auth module
vi.mock('@/lib/api-public-auth', () => ({
  verifyPublicApiKey: () => isAuthorized,
  requirePublicApiKey: () =>
    isAuthorized
      ? null
      : NextResponse.json(
          { error: 'Non autorisé - API Key invalide ou manquante' },
          { status: 401 }
        ),
  withPublicApiAuth: async (
    request: NextRequest,
    handler: (request: NextRequest) => Promise<NextResponse>
  ) => {
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Non autorisé - API Key invalide ou manquante' },
        { status: 401 }
      )
    }
    return handler(request)
  },
}))
