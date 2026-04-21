import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

import { mockPrismaClient, resetPrismaMocks } from '../mocks/prisma'
import { setPublicApiAuth, resetPublicApiAuthMocks } from '../mocks/api-public-auth'
import { mockPublicProperty } from '../mocks/fixtures'

import { GET } from '@/app/api/public/properties/recent/route'

describe('/api/public/properties/recent', () => {
  beforeEach(() => {
    resetPrismaMocks()
    resetPublicApiAuthMocks()
  })

  it('retourne 401 sans API Key', async () => {
    setPublicApiAuth(false)
    const req = new NextRequest('http://localhost:3000/api/public/properties/recent')
    const response = await GET(req)
    expect(response.status).toBe(401)
  })

  it('retourne les derniers biens publics (défaut 5)', async () => {
    mockPrismaClient.property.findMany.mockResolvedValue([mockPublicProperty])

    const req = new NextRequest('http://localhost:3000/api/public/properties/recent')
    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.count).toBe(1)
    expect(mockPrismaClient.property.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5 })
    )
  })

  it('clamp limit à 20 max', async () => {
    mockPrismaClient.property.findMany.mockResolvedValue([])

    const req = new NextRequest('http://localhost:3000/api/public/properties/recent?limit=9999')
    await GET(req)

    expect(mockPrismaClient.property.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 20 })
    )
  })

  it('clamp limit à 1 min', async () => {
    mockPrismaClient.property.findMany.mockResolvedValue([])

    const req = new NextRequest('http://localhost:3000/api/public/properties/recent?limit=0')
    await GET(req)

    expect(mockPrismaClient.property.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 1 })
    )
  })

  it('retourne 500 si Prisma rejette', async () => {
    mockPrismaClient.property.findMany.mockRejectedValue(new Error('DB'))
    const req = new NextRequest('http://localhost:3000/api/public/properties/recent')
    const response = await GET(req)
    expect(response.status).toBe(500)
  })

  it('ne fuit pas les champs sensibles', async () => {
    mockPrismaClient.property.findMany.mockResolvedValue([
      {
        ...mockPublicProperty,
        internalNotes: 'X',
        userId: 'u',
        user: { name: 'A' },
      },
    ])
    const req = new NextRequest('http://localhost:3000/api/public/properties/recent')
    const response = await GET(req)
    const data = await response.json()
    expect(data.data[0]).not.toHaveProperty('internalNotes')
    expect(data.data[0]).not.toHaveProperty('userId')
    expect(data.data[0]).not.toHaveProperty('user')
  })
})
