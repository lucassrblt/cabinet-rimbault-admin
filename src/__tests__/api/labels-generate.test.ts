import { describe, it, expect, beforeEach } from 'vitest'

// Import mocks
import { mockPrismaClient, resetPrismaMocks } from '../mocks/prisma'
import { setAuthenticated, resetAuthMocks } from '../mocks/auth'
import {
  mockUploadToStorage,
  setUploadSuccess,
  setUploadFailure,
  resetSupabaseMocks,
} from '../mocks/supabase'
import {
  mockPropertyBase,
  mockPropertyEnergy,
  mockPropertyImages,
} from '../mocks/fixtures'

// Import the route handler
import { POST } from '@/app/api/labels/generate/route'

describe('/api/labels/generate', () => {
  beforeEach(() => {
    resetPrismaMocks()
    resetAuthMocks()
    resetSupabaseMocks()
  })

  describe('POST /api/labels/generate', () => {
    it('devrait retourner 401 si non authentifié', async () => {
      setAuthenticated(false)

      const request = new Request('http://localhost:3000/api/labels/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 'prop-123',
          primaryColor: '#1e40af',
        }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Non autorisé. Veuillez vous connecter.')
    })

    it('devrait retourner 404 si propriété non trouvée', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/labels/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 'non-existent',
          primaryColor: '#1e40af',
        }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Annonce non trouvée')
    })

    it('devrait retourner 400 si données DPE manquantes', async () => {
      setAuthenticated(true)

      // Propriété sans données energy
      mockPrismaClient.property.findUnique.mockResolvedValue({
        ...mockPropertyBase,
        images: mockPropertyImages,
        energy: null,
        finance: null,
        location: null,
        characteristics: null,
      })

      const request = new Request('http://localhost:3000/api/labels/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 'prop-123',
          primaryColor: '#1e40af',
        }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Les données DPE sont requises pour générer l\'étiquette')
    })

    it('devrait retourner 400 si données GES manquantes', async () => {
      setAuthenticated(true)

      // Propriété avec DPE mais sans GES
      mockPrismaClient.property.findUnique.mockResolvedValue({
        ...mockPropertyBase,
        images: mockPropertyImages,
        energy: {
          ...mockPropertyEnergy,
          gesValue: null,
          gesClass: null,
        },
        finance: null,
        location: null,
        characteristics: null,
      })

      const request = new Request('http://localhost:3000/api/labels/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 'prop-123',
          primaryColor: '#1e40af',
        }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Les données GES sont requises pour générer l\'étiquette')
    })

    it('devrait générer une étiquette avec des URLs de preview fournies', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockResolvedValueOnce({
        ...mockPropertyBase,
        images: mockPropertyImages,
        energy: mockPropertyEnergy,
        finance: null,
        location: null,
        characteristics: null,
      })

      mockPrismaClient.propertyEnergy.upsert.mockResolvedValue(mockPropertyEnergy)

      mockPrismaClient.property.findUnique.mockResolvedValueOnce({
        ...mockPropertyBase,
        images: mockPropertyImages,
        energy: {
          ...mockPropertyEnergy,
          labelGenerated: true,
        },
        finance: null,
        location: null,
        characteristics: null,
      })

      const request = new Request('http://localhost:3000/api/labels/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 'prop-123',
          primaryColor: '#1e40af',
          previewDpeUrl: 'https://storage.example.com/dpe.png',
          previewGesUrl: 'https://storage.example.com/ges.png',
          selectedPhotoIds: ['img-1'],
        }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.labelData.dpeImageUrl).toBe('https://storage.example.com/dpe.png')
      expect(data.labelData.gesImageUrl).toBe('https://storage.example.com/ges.png')
      expect(data.labelData.selectedPhotos).toHaveLength(1)
    })

    it('devrait utiliser les valeurs énergétiques personnalisées si fournies', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockResolvedValueOnce({
        ...mockPropertyBase,
        images: mockPropertyImages,
        energy: mockPropertyEnergy,
        finance: null,
        location: null,
        characteristics: null,
      })

      mockPrismaClient.propertyEnergy.upsert.mockResolvedValue(mockPropertyEnergy)

      mockPrismaClient.property.findUnique.mockResolvedValueOnce({
        ...mockPropertyBase,
        images: mockPropertyImages,
        energy: mockPropertyEnergy,
        finance: null,
        location: null,
        characteristics: null,
      })

      const request = new Request('http://localhost:3000/api/labels/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 'prop-123',
          primaryColor: '#1e40af',
          previewDpeUrl: 'https://storage.example.com/dpe.png',
          previewGesUrl: 'https://storage.example.com/ges.png',
          energyValue: 150,
          energyClass: 'C',
          gesValue: 25,
          gesClass: 'D',
        }),
      })
      await POST(request)

      expect(mockPrismaClient.propertyEnergy.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            energyValue: 150,
            energyClass: 'C',
            gesValue: 25,
            gesClass: 'D',
          }),
        })
      )
    })

    it('devrait générer les étiquettes localement si pas de preview URLs', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockResolvedValueOnce({
        ...mockPropertyBase,
        reference: 'REF-001',
        images: mockPropertyImages,
        energy: mockPropertyEnergy,
        finance: null,
        location: null,
        characteristics: null,
      })

      setUploadSuccess('https://storage.example.com/REF-001_dpe.svg')

      mockPrismaClient.propertyEnergy.findUnique.mockResolvedValue(mockPropertyEnergy)
      mockPrismaClient.propertyEnergy.update.mockResolvedValue(mockPropertyEnergy)
      mockPrismaClient.propertyEnergy.upsert.mockResolvedValue(mockPropertyEnergy)
      mockPrismaClient.propertyDocument.findFirst.mockResolvedValue(null)
      mockPrismaClient.propertyDocument.create.mockResolvedValue({ id: 'doc-1' })

      mockPrismaClient.property.findUnique.mockResolvedValueOnce({
        ...mockPropertyBase,
        images: mockPropertyImages,
        energy: mockPropertyEnergy,
        finance: null,
        location: null,
        characteristics: null,
      })

      const request = new Request('http://localhost:3000/api/labels/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 'prop-123',
          primaryColor: '#1e40af',
        }),
      })
      const response = await POST(request)
      await response.json()

      expect(response.status).toBe(200)
      // Aucun appel réseau sortant : les SVG sont produits localement puis
      // uploadés (DPE + GES).
      expect(mockUploadToStorage).toHaveBeenCalledTimes(2)
      const [[dpeBucket, dpePath, , dpeMime]] = mockUploadToStorage.mock.calls
      expect(dpeBucket).toBe('property-files')
      expect(dpePath).toMatch(/REF-001\/energy\/REF-001_dpe_\d+\.svg$/)
      expect(dpeMime).toBe('image/svg+xml')
    })

    it('devrait retourner 500 si l\'upload des étiquettes échoue', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockResolvedValue({
        ...mockPropertyBase,
        reference: 'REF-001',
        images: mockPropertyImages,
        energy: mockPropertyEnergy,
        finance: null,
        location: null,
        characteristics: null,
      })

      setUploadFailure(new Error('Storage indisponible'))

      const request = new Request('http://localhost:3000/api/labels/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 'prop-123',
          primaryColor: '#1e40af',
        }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain("l'upload de l'image DPE")
    })

    it('devrait upserter PropertyEnergy si elle n\'existe pas', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockResolvedValueOnce({
        ...mockPropertyBase,
        images: mockPropertyImages,
        energy: null,
        finance: null,
        location: null,
        characteristics: null,
      })

      mockPrismaClient.propertyEnergy.upsert.mockResolvedValue(mockPropertyEnergy)

      mockPrismaClient.property.findUnique.mockResolvedValueOnce({
        ...mockPropertyBase,
        images: mockPropertyImages,
        energy: mockPropertyEnergy,
        finance: null,
        location: null,
        characteristics: null,
      })

      const request = new Request('http://localhost:3000/api/labels/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 'prop-123',
          primaryColor: '#1e40af',
          previewDpeUrl: 'https://storage.example.com/dpe.png',
          previewGesUrl: 'https://storage.example.com/ges.png',
          energyValue: 180,
          energyClass: 'D',
          gesValue: 35,
          gesClass: 'E',
        }),
      })
      await POST(request)

      expect(mockPrismaClient.propertyEnergy.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { propertyId: 'prop-123' },
          create: expect.objectContaining({
            propertyId: 'prop-123',
            energyValue: 180,
            energyClass: 'D',
            gesValue: 35,
            gesClass: 'E',
            labelGenerated: true,
          }),
        })
      )
    })

    it('devrait gérer le selectedImageIndex pour rétrocompatibilité', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockResolvedValueOnce({
        ...mockPropertyBase,
        images: mockPropertyImages,
        energy: mockPropertyEnergy,
        finance: null,
        location: null,
        characteristics: null,
      })

      mockPrismaClient.propertyEnergy.upsert.mockResolvedValue(mockPropertyEnergy)

      mockPrismaClient.property.findUnique.mockResolvedValueOnce({
        ...mockPropertyBase,
        images: mockPropertyImages,
        energy: mockPropertyEnergy,
        finance: null,
        location: null,
        characteristics: null,
      })

      const request = new Request('http://localhost:3000/api/labels/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 'prop-123',
          primaryColor: '#1e40af',
          previewDpeUrl: 'https://storage.example.com/dpe.png',
          previewGesUrl: 'https://storage.example.com/ges.png',
          selectedImageIndex: 1, // Deprecated but should still work
        }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.labelData.selectedPhotos).toHaveLength(1)
      expect(data.labelData.selectedPhotos[0].id).toBe('img-2') // Second image
    })

    it('devrait retourner 500 en cas d\'erreur générale', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost:3000/api/labels/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 'prop-123',
          primaryColor: '#1e40af',
        }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Erreur lors de la génération de l\'étiquette')
    })
  })
})

