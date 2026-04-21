import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

import { mockPrismaClient, resetPrismaMocks } from '../mocks/prisma'
import { setPublicApiAuth, resetPublicApiAuthMocks } from '../mocks/api-public-auth'
import { mockPublicProperty } from '../mocks/fixtures'

import { GET } from '@/app/api/public/properties/sale/route'

describe('/api/public/properties/sale', () => {
  beforeEach(() => {
    resetPrismaMocks()
    resetPublicApiAuthMocks()
  })

  it('retourne 401 sans API Key', async () => {
    setPublicApiAuth(false)
    const req = new NextRequest('http://localhost:3000/api/public/properties/sale')
    const response = await GET(req)
    expect(response.status).toBe(401)
  })

  it('filtre par transactionType=VENTE', async () => {
    mockPrismaClient.property.findMany.mockResolvedValue([mockPublicProperty])

    const req = new NextRequest('http://localhost:3000/api/public/properties/sale')
    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.filters.transactionType).toBe('VENTE')
    expect(mockPrismaClient.property.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ transactionType: 'VENTE' }),
      })
    )
  })

  it('applique postalCode et city', async () => {
    mockPrismaClient.property.findMany.mockResolvedValue([])

    const req = new NextRequest(
      'http://localhost:3000/api/public/properties/sale?postalCode=75001&city=Paris'
    )
    await GET(req)

    expect(mockPrismaClient.property.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          location: expect.objectContaining({
            postalCode: '75001',
            city: { contains: 'Paris', mode: 'insensitive' },
          }),
        }),
      })
    )
  })

  it('clamp limit à 100', async () => {
    mockPrismaClient.property.findMany.mockResolvedValue([])
    const req = new NextRequest('http://localhost:3000/api/public/properties/sale?limit=500')
    await GET(req)

    expect(mockPrismaClient.property.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 })
    )
  })

  it('retourne 500 si Prisma rejette', async () => {
    mockPrismaClient.property.findMany.mockRejectedValue(new Error('DB'))
    const req = new NextRequest('http://localhost:3000/api/public/properties/sale')
    const response = await GET(req)
    expect(response.status).toBe(500)
  })

  it('ne fuit pas les champs sensibles', async () => {
    mockPrismaClient.property.findMany.mockResolvedValue([
      {
        ...mockPublicProperty,
        internalNotes: 'hidden',
        userId: 'u',
        user: { name: 'A' },
      },
    ])
    const req = new NextRequest('http://localhost:3000/api/public/properties/sale')
    const response = await GET(req)
    const data = await response.json()
    expect(data.data[0]).not.toHaveProperty('internalNotes')
    expect(data.data[0]).not.toHaveProperty('userId')
    expect(data.data[0]).not.toHaveProperty('user')
  })
})
