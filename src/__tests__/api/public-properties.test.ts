import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

import { mockPrismaClient, resetPrismaMocks } from '../mocks/prisma'
import { setPublicApiAuth, resetPublicApiAuthMocks } from '../mocks/api-public-auth'
import { mockPublicProperty } from '../mocks/fixtures'

import { GET } from '@/app/api/public/properties/route'

describe('/api/public/properties', () => {
  beforeEach(() => {
    resetPrismaMocks()
    resetPublicApiAuthMocks()
    mockPrismaClient.property.count.mockResolvedValue(0)
    mockPrismaClient.property.findMany.mockResolvedValue([])
  })

  it('retourne 401 sans API Key', async () => {
    setPublicApiAuth(false)
    const req = new NextRequest('http://localhost:3000/api/public/properties')
    const response = await GET(req)
    expect(response.status).toBe(401)
  })

  it('retourne la shape publique enveloppée { success, count, total, data, filters }', async () => {
    mockPrismaClient.property.count.mockResolvedValue(1)
    mockPrismaClient.property.findMany.mockResolvedValue([mockPublicProperty])

    const req = new NextRequest('http://localhost:3000/api/public/properties')
    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.count).toBe(1)
    expect(data.total).toBe(1)
    expect(data.offset).toBe(0)
    expect(data.limit).toBe(50)
    expect(Array.isArray(data.data)).toBe(true)
    expect(typeof data.filters).toBe('object')
  })

  it('ne fuit pas les champs sensibles (internalNotes, userId, user)', async () => {
    const propertyWithSensitive = {
      ...mockPublicProperty,
      internalNotes: 'should be hidden',
      userId: 'user-xxx',
      user: { id: 'user-xxx', name: 'Agent' },
    }
    mockPrismaClient.property.count.mockResolvedValue(1)
    mockPrismaClient.property.findMany.mockResolvedValue([propertyWithSensitive])

    const req = new NextRequest('http://localhost:3000/api/public/properties')
    const response = await GET(req)
    const data = await response.json()

    expect(data.data[0]).not.toHaveProperty('internalNotes')
    expect(data.data[0]).not.toHaveProperty('userId')
    expect(data.data[0]).not.toHaveProperty('user')
  })

  it('filtre par transactionType', async () => {
    const req = new NextRequest('http://localhost:3000/api/public/properties?transactionType=VENTE')
    await GET(req)

    expect(mockPrismaClient.property.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ transactionType: 'VENTE' }),
      })
    )
  })

  it('filtre par tableau de propertyType', async () => {
    const req = new NextRequest(
      'http://localhost:3000/api/public/properties?propertyType=APPARTEMENT&propertyType=MAISON'
    )
    await GET(req)

    expect(mockPrismaClient.property.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          propertyType: { in: ['APPARTEMENT', 'MAISON'] },
        }),
      })
    )
  })

  it('applique les plages minPrice/maxPrice via finance', async () => {
    const req = new NextRequest(
      'http://localhost:3000/api/public/properties?minPrice=100000&maxPrice=500000'
    )
    await GET(req)

    expect(mockPrismaClient.property.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          finance: { price: { gte: 100000, lte: 500000 } },
        }),
      })
    )
  })

  it('clamp le limit à 100 max', async () => {
    const req = new NextRequest('http://localhost:3000/api/public/properties?limit=9999')
    const response = await GET(req)
    const data = await response.json()

    expect(data.limit).toBe(100)
    expect(mockPrismaClient.property.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 })
    )
  })

  it('retourne 400 sur sortBy invalide', async () => {
    const req = new NextRequest('http://localhost:3000/api/public/properties?sortBy=nope')
    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('sortBy')
  })

  it('retourne 400 sur transactionType invalide', async () => {
    const req = new NextRequest('http://localhost:3000/api/public/properties?transactionType=XXX')
    const response = await GET(req)
    expect(response.status).toBe(400)
  })

  it('retourne 400 sur dpe invalide', async () => {
    const req = new NextRequest('http://localhost:3000/api/public/properties?dpe=Z')
    const response = await GET(req)
    expect(response.status).toBe(400)
  })

  it('retourne 400 sur hasBalcony non-boolean', async () => {
    const req = new NextRequest('http://localhost:3000/api/public/properties?hasBalcony=maybe')
    const response = await GET(req)
    expect(response.status).toBe(400)
  })

  it('retourne 400 sur un status interne (ARCHIVE)', async () => {
    const req = new NextRequest('http://localhost:3000/api/public/properties?status=ARCHIVE')
    const response = await GET(req)
    expect(response.status).toBe(400)
  })

  it('retourne 500 si Prisma rejette', async () => {
    mockPrismaClient.property.count.mockRejectedValue(new Error('DB'))
    const req = new NextRequest('http://localhost:3000/api/public/properties')
    const response = await GET(req)
    const data = await response.json()
    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
  })
})
