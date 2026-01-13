import { describe, it, expect, beforeEach } from 'vitest'

// Import mocks
import { mockPrismaClient, resetPrismaMocks } from '../mocks/prisma'
import { setAuthenticated, resetAuthMocks } from '../mocks/auth'
import {
  mockFullProperty,
  mockPropertyBase,
  mockPropertyFinance,
  mockPropertyLocation,
  mockPropertyCharacteristics,
  mockPropertyEnergy,
} from '../mocks/fixtures'

// Import the route handlers
import { GET, PUT, DELETE } from '@/app/api/properties/[id]/route'

describe('/api/properties/[id]', () => {
  const mockParams = Promise.resolve({ id: 'prop-123' })

  beforeEach(() => {
    resetPrismaMocks()
    resetAuthMocks()
  })

  describe('GET /api/properties/[id]', () => {
    it('devrait retourner 401 si non authentifié', async () => {
      setAuthenticated(false)

      const request = new Request('http://localhost:3000/api/properties/prop-123')
      const response = await GET(request, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Non autorisé. Veuillez vous connecter.')
    })

    it('devrait retourner la propriété si trouvée', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockResolvedValue(mockFullProperty)

      const request = new Request('http://localhost:3000/api/properties/prop-123')
      const response = await GET(request, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.id).toBe('prop-123')
      expect(data.title).toBe('Appartement T3 Centre-Ville')
      expect(mockPrismaClient.property.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prop-123' },
        })
      )
    })

    it('devrait retourner 404 si propriété non trouvée', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/properties/non-existent')
      const response = await GET(request, { params: Promise.resolve({ id: 'non-existent' }) })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Annonce non trouvée')
    })

    it('devrait inclure toutes les relations dans la réponse', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockResolvedValue(mockFullProperty)

      const request = new Request('http://localhost:3000/api/properties/prop-123')
      const response = await GET(request, { params: mockParams })
      const data = await response.json()

      expect(data.finance).toBeDefined()
      expect(data.location).toBeDefined()
      expect(data.characteristics).toBeDefined()
      expect(data.energy).toBeDefined()
      expect(data.images).toBeDefined()
      expect(data.user).toBeDefined()
    })

    it('devrait retourner 500 en cas d\'erreur', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost:3000/api/properties/prop-123')
      const response = await GET(request, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Erreur lors de la récupération de l\'annonce')
    })
  })

  describe('PUT /api/properties/[id]', () => {
    it('devrait retourner 401 si non authentifié', async () => {
      setAuthenticated(false)

      const request = new Request('http://localhost:3000/api/properties/prop-123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Title' }),
      })
      const response = await PUT(request, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Non autorisé. Veuillez vous connecter.')
    })

    it('devrait retourner 404 si propriété non trouvée', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/properties/non-existent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Title' }),
      })
      const response = await PUT(request, { params: Promise.resolve({ id: 'non-existent' }) })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Annonce non trouvée')
    })

    it('devrait mettre à jour la propriété', async () => {
      setAuthenticated(true)

      // Première requête findUnique pour vérifier l'existence
      mockPrismaClient.property.findUnique.mockResolvedValueOnce({
        ...mockFullProperty,
      })

      // Update de la propriété
      mockPrismaClient.property.update.mockResolvedValue({
        ...mockPropertyBase,
        title: 'Titre mis à jour',
      })

      // findUnique après update
      mockPrismaClient.property.findUnique.mockResolvedValueOnce({
        ...mockFullProperty,
        title: 'Titre mis à jour',
      })

      const request = new Request('http://localhost:3000/api/properties/prop-123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Titre mis à jour' }),
      })
      const response = await PUT(request, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.title).toBe('Titre mis à jour')
    })

    it('devrait mettre à jour les sous-tables existantes', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockResolvedValueOnce(mockFullProperty)
      mockPrismaClient.property.update.mockResolvedValue(mockPropertyBase)
      mockPrismaClient.property.findUnique.mockResolvedValueOnce(mockFullProperty)

      const request = new Request('http://localhost:3000/api/properties/prop-123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Updated',
          finance: { price: 300000 },
          location: { city: 'Marseille' },
        }),
      })
      await PUT(request, { params: mockParams })

      expect(mockPrismaClient.propertyFinance.update).toHaveBeenCalled()
      expect(mockPrismaClient.propertyLocation.update).toHaveBeenCalled()
    })

    it('devrait créer les sous-tables si elles n\'existent pas', async () => {
      setAuthenticated(true)

      // Propriété sans finance ni location
      const propertyWithoutSubtables = {
        ...mockPropertyBase,
        finance: null,
        location: null,
        characteristics: null,
        amenities: null,
        energy: null,
        copro: null,
      }

      mockPrismaClient.property.findUnique.mockResolvedValueOnce(propertyWithoutSubtables)
      mockPrismaClient.property.update.mockResolvedValue(mockPropertyBase)
      mockPrismaClient.property.findUnique.mockResolvedValueOnce({
        ...propertyWithoutSubtables,
        finance: mockPropertyFinance,
      })

      const request = new Request('http://localhost:3000/api/properties/prop-123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finance: { price: 200000 },
        }),
      })
      await PUT(request, { params: mockParams })

      expect(mockPrismaClient.propertyFinance.create).toHaveBeenCalled()
    })

    it('devrait retourner 400 si référence dupliquée', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockResolvedValueOnce(mockFullProperty)

      const error = new Error('Unique constraint failed on the constraint: `Property_reference_key`')
      mockPrismaClient.$transaction.mockRejectedValue(error)

      const request = new Request('http://localhost:3000/api/properties/prop-123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: 'EXISTING-REF' }),
      })
      const response = await PUT(request, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('La référence de l\'annonce existe déjà')
    })

    it('devrait retourner 500 en cas d\'erreur générale', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockResolvedValueOnce(mockFullProperty)
      mockPrismaClient.$transaction.mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost:3000/api/properties/prop-123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated' }),
      })
      const response = await PUT(request, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Erreur lors de la mise à jour de l\'annonce')
    })
  })

  describe('DELETE /api/properties/[id]', () => {
    it('devrait retourner 401 si non authentifié', async () => {
      setAuthenticated(false)

      const request = new Request('http://localhost:3000/api/properties/prop-123', {
        method: 'DELETE',
      })
      const response = await DELETE(request, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Non autorisé. Veuillez vous connecter.')
    })

    it('devrait retourner 404 si propriété non trouvée', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/properties/non-existent', {
        method: 'DELETE',
      })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'non-existent' }) })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Annonce non trouvée')
    })

    it('devrait supprimer la propriété', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockResolvedValue(mockPropertyBase)
      mockPrismaClient.property.delete.mockResolvedValue(mockPropertyBase)

      const request = new Request('http://localhost:3000/api/properties/prop-123', {
        method: 'DELETE',
      })
      const response = await DELETE(request, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockPrismaClient.property.delete).toHaveBeenCalledWith({
        where: { id: 'prop-123' },
      })
    })

    it('devrait retourner 500 en cas d\'erreur', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockResolvedValue(mockPropertyBase)
      mockPrismaClient.property.delete.mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost:3000/api/properties/prop-123', {
        method: 'DELETE',
      })
      const response = await DELETE(request, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Erreur lors de la suppression de l\'annonce')
    })
  })
})

