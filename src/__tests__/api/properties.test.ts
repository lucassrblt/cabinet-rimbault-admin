import { describe, it, expect, beforeEach } from 'vitest'

// Import mocks (they will be hoisted)
import { mockPrismaClient, resetPrismaMocks } from '../mocks/prisma'
import { setAuthenticated, resetAuthMocks } from '../mocks/auth'
import {
  mockFullProperty,
  mockPropertyBase,
  mockCreatePropertyBody,
  mockPropertyFinance,
  mockPropertyLocation,
  mockPropertyCharacteristics,
} from '../mocks/fixtures'

// Import the route handlers
import { GET, POST } from '@/app/api/properties/route'

describe('/api/properties', () => {
  beforeEach(() => {
    resetPrismaMocks()
    resetAuthMocks()
  })

  describe('GET /api/properties', () => {
    it('devrait retourner 401 si non authentifié', async () => {
      setAuthenticated(false)

      const request = new Request('http://localhost:3000/api/properties')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Non autorisé. Veuillez vous connecter.')
    })

    it('devrait retourner la liste des propriétés si authentifié', async () => {
      setAuthenticated(true)

      const mockProperties = [mockFullProperty]
      mockPrismaClient.property.findMany.mockResolvedValue(mockProperties)

      const request = new Request('http://localhost:3000/api/properties')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0].id).toBe('prop-123')
      expect(mockPrismaClient.property.findMany).toHaveBeenCalledTimes(1)
    })

    it('devrait filtrer les propriétés avec label généré', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findMany.mockResolvedValue([])

      const request = new Request('http://localhost:3000/api/properties?labelFilter=generated')
      await GET(request)

      expect(mockPrismaClient.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { energy: { labelGenerated: true } },
        })
      )
    })

    it('devrait filtrer les propriétés sans label généré', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findMany.mockResolvedValue([])

      const request = new Request('http://localhost:3000/api/properties?labelFilter=not_generated')
      await GET(request)

      expect(mockPrismaClient.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { energy: null },
              { energy: { labelGenerated: false } },
            ],
          },
        })
      )
    })

    it('devrait retourner toutes les propriétés sans filtre', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findMany.mockResolvedValue([])

      const request = new Request('http://localhost:3000/api/properties?labelFilter=all')
      await GET(request)

      expect(mockPrismaClient.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        })
      )
    })

    it('devrait retourner 500 en cas d\'erreur base de données', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findMany.mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost:3000/api/properties')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Erreur lors de la récupération des annonces')
    })
  })

  describe('POST /api/properties', () => {
    it('devrait retourner 401 si non authentifié', async () => {
      setAuthenticated(false)

      const request = new Request('http://localhost:3000/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCreatePropertyBody),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Non autorisé. Veuillez vous connecter.')
    })

    it('devrait créer une nouvelle propriété', async () => {
      setAuthenticated(true)

      const createdProperty = { ...mockPropertyBase, id: 'new-prop-123' }
      mockPrismaClient.property.create.mockResolvedValue(createdProperty)
      mockPrismaClient.property.findUnique.mockResolvedValue({
        ...createdProperty,
        finance: mockPropertyFinance,
        location: mockPropertyLocation,
        characteristics: mockPropertyCharacteristics,
        amenities: null,
        energy: null,
        copro: null,
        images: [],
      })

      const request = new Request('http://localhost:3000/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCreatePropertyBody),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.id).toBe('new-prop-123')
      expect(mockPrismaClient.$transaction).toHaveBeenCalled()
    })

    it('devrait créer les sous-tables finance, location, characteristics', async () => {
      setAuthenticated(true)

      const createdProperty = { ...mockPropertyBase, id: 'new-prop-123' }
      mockPrismaClient.property.create.mockResolvedValue(createdProperty)
      mockPrismaClient.property.findUnique.mockResolvedValue({
        ...createdProperty,
        finance: mockPropertyFinance,
        location: mockPropertyLocation,
        characteristics: mockPropertyCharacteristics,
        amenities: null,
        energy: null,
        copro: null,
        images: [],
      })

      const request = new Request('http://localhost:3000/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCreatePropertyBody),
      })
      await POST(request)

      expect(mockPrismaClient.propertyFinance.create).toHaveBeenCalled()
      expect(mockPrismaClient.propertyLocation.create).toHaveBeenCalled()
      expect(mockPrismaClient.propertyCharacteristics.create).toHaveBeenCalled()
    })

    it('devrait retourner 400 si la référence existe déjà', async () => {
      setAuthenticated(true)

      const error = new Error('Unique constraint failed on the constraint: `Property_reference_key`')
      mockPrismaClient.$transaction.mockRejectedValue(error)

      const request = new Request('http://localhost:3000/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCreatePropertyBody),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('La référence de l\'annonce existe déjà')
    })

    it('devrait retourner 500 en cas d\'erreur générale', async () => {
      setAuthenticated(true)

      mockPrismaClient.$transaction.mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost:3000/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCreatePropertyBody),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Erreur lors de la création de l\'annonce')
    })

    it('devrait créer une propriété sans sous-tables optionnelles', async () => {
      setAuthenticated(true)

      const createdProperty = { ...mockPropertyBase, id: 'new-prop-123' }
      mockPrismaClient.property.create.mockResolvedValue(createdProperty)
      mockPrismaClient.property.findUnique.mockResolvedValue({
        ...createdProperty,
        finance: null,
        location: null,
        characteristics: null,
        amenities: null,
        energy: null,
        copro: null,
        images: [],
      })

      const minimalBody = {
        title: 'Test Property',
        description: 'Description',
        reference: 'REF-MIN',
        propertyType: 'APPARTEMENT',
        transactionType: 'VENTE',
      }

      const request = new Request('http://localhost:3000/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(minimalBody),
      })
      const response = await POST(request)

      expect(response.status).toBe(201)
      // Les sous-tables ne devraient pas avoir été créées
      expect(mockPrismaClient.propertyFinance.create).not.toHaveBeenCalled()
      expect(mockPrismaClient.propertyLocation.create).not.toHaveBeenCalled()
    })
  })
})

