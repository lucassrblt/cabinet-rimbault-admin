import { describe, it, expect, beforeEach } from 'vitest'

// Import mocks
import { mockPrismaClient, resetPrismaMocks } from '../mocks/prisma'
import { setAuthenticated, resetAuthMocks } from '../mocks/auth'
import { resetSupabaseMocks } from '../mocks/supabase'
import {
  mockPropertyBase,
  mockPropertyEnergy,
} from '../mocks/fixtures'

// Import the route handler
import { POST } from '@/app/api/labels/preview-energy/route'

describe('/api/labels/preview-energy', () => {
  beforeEach(() => {
    resetPrismaMocks()
    resetAuthMocks()
    resetSupabaseMocks()
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

    it('devrait générer les previews DPE/GES avec succès (data URLs, pas d\'upload)', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockResolvedValue({
        ...mockPropertyBase,
        reference: 'REF-001',
        energy: mockPropertyEnergy,
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

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.preview.dpeImageUrl).toBeDefined()
      expect(data.preview.gesImageUrl).toBeDefined()
      expect(data.preview.dpeImageUrl).toMatch(/^data:image\/svg\+xml;base64,/)
      expect(data.preview.gesImageUrl).toMatch(/^data:image\/svg\+xml;base64,/)
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

    it('devrait retourner les informations de la propriété', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockResolvedValue({
        ...mockPropertyBase,
        id: 'prop-123',
        reference: 'REF-001',
        title: 'Test Property',
        energy: mockPropertyEnergy,
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

      expect(response.status).toBe(200)
      expect(data.property.id).toBe('prop-123')
      expect(data.property.reference).toBe('REF-001')
      expect(data.property.title).toBe('Test Property')
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

