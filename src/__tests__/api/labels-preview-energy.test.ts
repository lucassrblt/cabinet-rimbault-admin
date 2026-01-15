import { describe, it, expect, beforeEach, vi } from 'vitest'

// Import mocks
import { mockPrismaClient, resetPrismaMocks } from '../mocks/prisma'
import { setAuthenticated, resetAuthMocks } from '../mocks/auth'
import {
  setUploadSuccess,
  setUploadFailure,
  resetSupabaseMocks,
} from '../mocks/supabase'
import {
  mockPropertyBase,
  mockPropertyEnergy,
} from '../mocks/fixtures'

// Import the route handler
import { POST } from '@/app/api/labels/preview-energy/route'

// Mock global fetch for external API calls
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('/api/labels/preview-energy', () => {
  beforeEach(() => {
    resetPrismaMocks()
    resetAuthMocks()
    resetSupabaseMocks()
    mockFetch.mockReset()
  })

  describe('POST /api/labels/preview-energy', () => {
    it('devrait retourner 401 si non authentifié', async () => {
      setAuthenticated(false)

      const request = new Request('http://localhost:3000/api/labels/preview-energy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 'prop-123',
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

      const request = new Request('http://localhost:3000/api/labels/preview-energy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 'non-existent',
        }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Annonce non trouvée')
    })

    it('devrait retourner 400 si données DPE manquantes', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockResolvedValue({
        ...mockPropertyBase,
        energy: null,
      })

      const request = new Request('http://localhost:3000/api/labels/preview-energy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 'prop-123',
        }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Les données DPE (classe et valeur) sont requises')
    })

    it('devrait retourner 400 si données GES manquantes', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockResolvedValue({
        ...mockPropertyBase,
        energy: {
          ...mockPropertyEnergy,
          gesValue: null,
          gesClass: null,
        },
      })

      const request = new Request('http://localhost:3000/api/labels/preview-energy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 'prop-123',
        }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Les données GES (classe et valeur) sont requises')
    })

    it('devrait générer les previews DPE/GES avec succès', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockResolvedValue({
        ...mockPropertyBase,
        reference: 'REF-001',
        energy: mockPropertyEnergy,
      })

      // Mock successful external API calls
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
        headers: new Map([['content-type', 'image/png']]),
      })

      setUploadSuccess('https://storage.example.com/uploaded.png')

      const request = new Request('http://localhost:3000/api/labels/preview-energy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 'prop-123',
        }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.preview.dpeImageUrl).toBeDefined()
      expect(data.preview.gesImageUrl).toBeDefined()
      expect(data.preview.energyValue).toBe(180)
      expect(data.preview.energyClass).toBe('D')
    })

    it('devrait utiliser les valeurs personnalisées si fournies', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockResolvedValue({
        ...mockPropertyBase,
        reference: 'REF-001',
        energy: mockPropertyEnergy,
      })

      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
        headers: new Map([['content-type', 'image/png']]),
      })

      setUploadSuccess('https://storage.example.com/uploaded.png')

      const request = new Request('http://localhost:3000/api/labels/preview-energy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 'prop-123',
          energyValue: 100,
          energyClass: 'B',
          gesValue: 15,
          gesClass: 'C',
        }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.preview.energyValue).toBe(100)
      expect(data.preview.energyClass).toBe('B')
      expect(data.preview.gesValue).toBe(15)
      expect(data.preview.gesClass).toBe('C')
    })

    it('devrait retourner 500 si fetch DPE échoue', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockResolvedValue({
        ...mockPropertyBase,
        reference: 'REF-001',
        energy: mockPropertyEnergy,
      })

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      const request = new Request('http://localhost:3000/api/labels/preview-energy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 'prop-123',
        }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Impossible de récupérer l\'image DPE')
    })

    it('devrait retourner 500 si fetch GES échoue', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockResolvedValue({
        ...mockPropertyBase,
        reference: 'REF-001',
        energy: mockPropertyEnergy,
      })

      // DPE succeeds, GES fails
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
          headers: new Map([['content-type', 'image/png']]),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        })

      const request = new Request('http://localhost:3000/api/labels/preview-energy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 'prop-123',
        }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Impossible de récupérer l\'image GES')
    })

    it('devrait retourner 500 si upload DPE échoue', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockResolvedValue({
        ...mockPropertyBase,
        reference: 'REF-001',
        energy: mockPropertyEnergy,
      })

      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
        headers: new Map([['content-type', 'image/png']]),
      })

      setUploadFailure(new Error('Storage error'))

      const request = new Request('http://localhost:3000/api/labels/preview-energy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 'prop-123',
        }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Erreur lors de l\'upload de l\'image DPE dans Supabase Storage')
    })

    it('devrait retourner les informations de la propriété', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockResolvedValue({
        ...mockPropertyBase,
        id: 'prop-123',
        reference: 'REF-001',
        title: 'Test Property',
        energy: mockPropertyEnergy,
      })

      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
        headers: new Map([['content-type', 'image/png']]),
      })

      setUploadSuccess('https://storage.example.com/uploaded.png')

      const request = new Request('http://localhost:3000/api/labels/preview-energy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 'prop-123',
        }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.property.id).toBe('prop-123')
      expect(data.property.reference).toBe('REF-001')
      expect(data.property.title).toBe('Test Property')
    })

    it('devrait appeler l\'API externe avec les bons paramètres', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockResolvedValue({
        ...mockPropertyBase,
        reference: 'REF-001',
        energy: {
          ...mockPropertyEnergy,
          energyValue: 200,
          energyClass: 'E',
          gesValue: 40,
          gesClass: 'F',
        },
      })

      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
        headers: new Map([['content-type', 'image/png']]),
      })

      setUploadSuccess('https://storage.example.com/uploaded.png')

      const request = new Request('http://localhost:3000/api/labels/preview-energy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 'prop-123',
        }),
      })
      await POST(request)

      // Verify DPE API was called with correct params
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('type=dpe'),
        expect.any(Object)
      )
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('valeur=200'),
        expect.any(Object)
      )
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('lettre=e'),
        expect.any(Object)
      )

      // Verify GES API was called with correct params
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('type=ges'),
        expect.any(Object)
      )
    })

    it('devrait retourner 500 en cas d\'erreur générale', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost:3000/api/labels/preview-energy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: 'prop-123',
        }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Erreur lors de la prévisualisation des étiquettes énergie')
    })
  })
})

