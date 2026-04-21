import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

import { mockPrismaClient, resetPrismaMocks } from '../mocks/prisma'
import { setPublicApiAuth, resetPublicApiAuthMocks } from '../mocks/api-public-auth'
import { mockPublicProperty } from '../mocks/fixtures'

import { GET } from '@/app/api/public/properties/rent/route'

describe('/api/public/properties/rent', () => {
  beforeEach(() => {
    resetPrismaMocks()
    resetPublicApiAuthMocks()
  })

  it('retourne 401 sans API Key', async () => {
    setPublicApiAuth(false)
    const req = new NextRequest('http://localhost:3000/api/public/properties/rent')
    const response = await GET(req)
    expect(response.status).toBe(401)
  })

  it('filtre par transactionType=LOCATION', async () => {
    mockPrismaClient.property.findMany.mockResolvedValue([mockPublicProperty])

    const req = new NextRequest('http://localhost:3000/api/public/properties/rent')
    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.filters.transactionType).toBe('LOCATION')
    expect(mockPrismaClient.property.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ transactionType: 'LOCATION' }),
      })
    )
  })

  it('clamp limit à 100', async () => {
    mockPrismaClient.property.findMany.mockResolvedValue([])
    const req = new NextRequest('http://localhost:3000/api/public/properties/rent?limit=500')
    await GET(req)

    expect(mockPrismaClient.property.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 })
    )
  })

  it('retourne 500 si Prisma rejette', async () => {
    mockPrismaClient.property.findMany.mockRejectedValue(new Error('DB'))
    const req = new NextRequest('http://localhost:3000/api/public/properties/rent')
    const response = await GET(req)
    expect(response.status).toBe(500)
  })
})
