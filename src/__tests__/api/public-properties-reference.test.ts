import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

import { mockPrismaClient, resetPrismaMocks } from '../mocks/prisma'
import { setPublicApiAuth, resetPublicApiAuthMocks } from '../mocks/api-public-auth'
import { mockPublicProperty } from '../mocks/fixtures'

import { GET } from '@/app/api/public/properties/[reference]/route'

const paramsOf = (reference: string) => ({ params: Promise.resolve({ reference }) })

describe('/api/public/properties/[reference]', () => {
  beforeEach(() => {
    resetPrismaMocks()
    resetPublicApiAuthMocks()
  })

  it('retourne 401 sans API Key', async () => {
    setPublicApiAuth(false)
    const req = new NextRequest('http://localhost:3000/api/public/properties/REF-001')
    const response = await GET(req, paramsOf('REF-001'))
    expect(response.status).toBe(401)
  })

  it('retourne 404 si le bien n\'existe pas', async () => {
    mockPrismaClient.property.findUnique.mockResolvedValue(null)

    const req = new NextRequest('http://localhost:3000/api/public/properties/REF-MISSING')
    const response = await GET(req, paramsOf('REF-MISSING'))
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Bien non trouvé')
  })

  it('retourne 404 si le bien n\'est pas publié', async () => {
    mockPrismaClient.property.findUnique.mockResolvedValue({
      ...mockPublicProperty,
      isPublished: false,
      status: 'DISPONIBLE',
    })

    const req = new NextRequest('http://localhost:3000/api/public/properties/REF-001')
    const response = await GET(req, paramsOf('REF-001'))
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Bien non disponible')
  })

  it('retourne 404 si le status est hors liste autorisée', async () => {
    mockPrismaClient.property.findUnique.mockResolvedValue({
      ...mockPublicProperty,
      isPublished: true,
      status: 'ARCHIVE',
    })

    const req = new NextRequest('http://localhost:3000/api/public/properties/REF-001')
    const response = await GET(req, paramsOf('REF-001'))
    expect(response.status).toBe(404)
  })

  it('retourne le bien enveloppé et incrémente le viewCount', async () => {
    mockPrismaClient.property.findUnique.mockResolvedValue({
      ...mockPublicProperty,
      id: 'prop-123',
      isPublished: true,
      status: 'DISPONIBLE',
    })
    mockPrismaClient.property.update.mockResolvedValue({})

    const req = new NextRequest('http://localhost:3000/api/public/properties/REF-001')
    const response = await GET(req, paramsOf('REF-001'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
    expect(data.data).not.toHaveProperty('internalNotes')
    // viewCount incrementé (fire-and-forget)
    expect(mockPrismaClient.property.update).toHaveBeenCalledWith({
      where: { id: 'prop-123' },
      data: { viewCount: { increment: 1 } },
    })
  })

  it('retourne 500 si Prisma rejette', async () => {
    mockPrismaClient.property.findUnique.mockRejectedValue(new Error('DB'))
    const req = new NextRequest('http://localhost:3000/api/public/properties/REF-001')
    const response = await GET(req, paramsOf('REF-001'))
    expect(response.status).toBe(500)
  })
})
