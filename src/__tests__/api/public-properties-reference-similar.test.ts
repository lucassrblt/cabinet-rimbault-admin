import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

import { mockPrismaClient, resetPrismaMocks } from '../mocks/prisma'
import { setPublicApiAuth, resetPublicApiAuthMocks } from '../mocks/api-public-auth'
import {
  mockPublicProperty,
  mockPropertyLocation,
  mockPropertyFinance,
  mockPropertyCharacteristics,
} from '../mocks/fixtures'

import { GET } from '@/app/api/public/properties/[reference]/similar/route'

const paramsOf = (reference: string) => ({ params: Promise.resolve({ reference }) })

const sourceProperty = {
  id: 'prop-source',
  reference: 'REF-SRC',
  isPublished: true,
  status: 'DISPONIBLE',
  transactionType: 'VENTE',
  propertyType: 'APPARTEMENT',
  location: mockPropertyLocation,
  finance: mockPropertyFinance,
  characteristics: mockPropertyCharacteristics,
}

describe('/api/public/properties/[reference]/similar', () => {
  beforeEach(() => {
    resetPrismaMocks()
    resetPublicApiAuthMocks()
  })

  it('retourne 401 sans API Key', async () => {
    setPublicApiAuth(false)
    const req = new NextRequest('http://localhost:3000/api/public/properties/REF-SRC/similar')
    const response = await GET(req, paramsOf('REF-SRC'))
    expect(response.status).toBe(401)
  })

  it('retourne 400 si limit n\'est pas un entier', async () => {
    const req = new NextRequest(
      'http://localhost:3000/api/public/properties/REF-SRC/similar?limit=abc'
    )
    const response = await GET(req, paramsOf('REF-SRC'))
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid value for limit')
  })

  it('retourne 404 si la propriété source n\'existe pas', async () => {
    mockPrismaClient.property.findUnique.mockResolvedValue(null)

    const req = new NextRequest('http://localhost:3000/api/public/properties/MISSING/similar')
    const response = await GET(req, paramsOf('MISSING'))
    const data = await response.json()
    expect(response.status).toBe(404)
    expect(data.error).toBe('Bien non trouvé')
  })

  it('retourne 404 si le bien source est indisponible', async () => {
    mockPrismaClient.property.findUnique.mockResolvedValue({
      ...sourceProperty,
      isPublished: false,
    })

    const req = new NextRequest('http://localhost:3000/api/public/properties/REF-SRC/similar')
    const response = await GET(req, paramsOf('REF-SRC'))
    const data = await response.json()
    expect(response.status).toBe(404)
    expect(data.error).toBe('Bien non disponible')
  })

  it('trouve des biens similaires au premier tier (même ville + prix/surface)', async () => {
    mockPrismaClient.property.findUnique.mockResolvedValue(sourceProperty)
    mockPrismaClient.property.findMany.mockResolvedValueOnce([
      { ...mockPublicProperty, id: 'prop-a' },
      { ...mockPublicProperty, id: 'prop-b' },
      { ...mockPublicProperty, id: 'prop-c' },
    ])

    const req = new NextRequest('http://localhost:3000/api/public/properties/REF-SRC/similar')
    const response = await GET(req, paramsOf('REF-SRC'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.count).toBe(3)
    expect(data.data).toHaveLength(3)
    // Un seul tier appelé
    expect(mockPrismaClient.property.findMany).toHaveBeenCalledTimes(1)
  })

  it('fallback progressivement si un tier retourne trop peu', async () => {
    mockPrismaClient.property.findUnique.mockResolvedValue(sourceProperty)
    mockPrismaClient.property.findMany
      .mockResolvedValueOnce([]) // Tier 1: ville + prix/surface
      .mockResolvedValueOnce([{ ...mockPublicProperty, id: 'p-city' }]) // Tier 2: ville
      .mockResolvedValueOnce([{ ...mockPublicProperty, id: 'p-pc' }]) // Tier 3: postalCode
      .mockResolvedValueOnce([{ ...mockPublicProperty, id: 'p-dept' }]) // Tier 4: département

    const req = new NextRequest('http://localhost:3000/api/public/properties/REF-SRC/similar?limit=3')
    const response = await GET(req, paramsOf('REF-SRC'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.count).toBe(3)
    expect(data.data.map((p: { id: string }) => p.id)).toEqual(['p-city', 'p-pc', 'p-dept'])
    expect(mockPrismaClient.property.findMany).toHaveBeenCalledTimes(4)
  })

  it('dédoublonne les ids entre tiers', async () => {
    mockPrismaClient.property.findUnique.mockResolvedValue(sourceProperty)
    mockPrismaClient.property.findMany
      .mockResolvedValueOnce([{ ...mockPublicProperty, id: 'dup' }]) // Tier 1
      .mockResolvedValueOnce([{ ...mockPublicProperty, id: 'dup' }]) // Tier 2 - même id
      .mockResolvedValueOnce([{ ...mockPublicProperty, id: 'new' }]) // Tier 3
      .mockResolvedValue([]) // Tiers suivants vides

    const req = new NextRequest('http://localhost:3000/api/public/properties/REF-SRC/similar?limit=3')
    const response = await GET(req, paramsOf('REF-SRC'))
    const data = await response.json()

    expect(response.status).toBe(200)
    const ids = data.data.map((p: { id: string }) => p.id)
    expect(ids).toContain('dup')
    expect(ids).toContain('new')
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('clamp limit à 10 max', async () => {
    mockPrismaClient.property.findUnique.mockResolvedValue(sourceProperty)
    mockPrismaClient.property.findMany.mockResolvedValue([])

    const req = new NextRequest(
      'http://localhost:3000/api/public/properties/REF-SRC/similar?limit=999'
    )
    await GET(req, paramsOf('REF-SRC'))

    // Le premier appel à findMany doit utiliser take <= 10
    const firstCallArgs = mockPrismaClient.property.findMany.mock.calls[0][0]
    expect(firstCallArgs.take).toBeLessThanOrEqual(10)
  })

  it('retourne 500 si Prisma rejette', async () => {
    mockPrismaClient.property.findUnique.mockRejectedValue(new Error('DB'))
    const req = new NextRequest('http://localhost:3000/api/public/properties/REF-SRC/similar')
    const response = await GET(req, paramsOf('REF-SRC'))
    expect(response.status).toBe(500)
  })
})
