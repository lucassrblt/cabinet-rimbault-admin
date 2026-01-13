import { describe, it, expect, beforeEach, vi } from 'vitest'

// Import mocks - must be before route import
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
} from '../mocks/fixtures'

// Import the route handler AFTER mocks are set up
import { POST } from '@/app/api/labels/upload-pdf/route'

describe('/api/labels/upload-pdf', () => {
  beforeEach(() => {
    resetPrismaMocks()
    resetAuthMocks()
    resetSupabaseMocks()
  })

  // Helper to create a mock request with mocked formData
  function createMockRequest(formDataResult: { pdf?: File | null; propertyId?: string | null }) {
    const mockFormData = new Map<string, unknown>()
    
    if (formDataResult.pdf !== undefined) {
      mockFormData.set('pdf', formDataResult.pdf)
    }
    if (formDataResult.propertyId !== undefined) {
      mockFormData.set('propertyId', formDataResult.propertyId)
    }

    const request = {
      formData: vi.fn().mockResolvedValue({
        get: (key: string) => mockFormData.get(key) ?? null,
      }),
    } as unknown as Request

    return request
  }

  // Create a mock File with arrayBuffer method
  function createMockFile(name: string = 'test.pdf'): File {
    const buffer = new ArrayBuffer(1024)
    const file = {
      name,
      type: 'application/pdf',
      size: 1024,
      arrayBuffer: () => Promise.resolve(buffer),
    } as unknown as File
    return file
  }

  describe('POST /api/labels/upload-pdf', () => {
    it('devrait retourner 401 si non authentifié', async () => {
      setAuthenticated(false)

      const request = createMockRequest({ pdf: createMockFile(), propertyId: 'prop-123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Non autorisé. Veuillez vous connecter.')
    })

    it('devrait retourner 400 si pas de fichier PDF', async () => {
      setAuthenticated(true)

      const request = createMockRequest({ pdf: null, propertyId: 'prop-123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Fichier PDF requis')
    })

    it('devrait retourner 400 si pas de propertyId', async () => {
      setAuthenticated(true)

      const request = createMockRequest({ pdf: createMockFile(), propertyId: null })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('ID de propriété requis')
    })

    it('devrait retourner 404 si propriété non trouvée', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockResolvedValue(null)

      const request = createMockRequest({ pdf: createMockFile(), propertyId: 'non-existent' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Annonce non trouvée')
    })

    it('devrait uploader le PDF et mettre à jour la propriété', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique
        .mockResolvedValueOnce({
          ...mockPropertyBase,
          reference: 'REF-001',
          energy: mockPropertyEnergy,
        })
        .mockResolvedValueOnce({
          ...mockPropertyBase,
          reference: 'REF-001',
          energy: {
            ...mockPropertyEnergy,
            labelPdfUrl: 'https://storage.example.com/labels/REF-001_etiquette_123.pdf',
          },
        })

      setUploadSuccess('https://storage.example.com/labels/REF-001_etiquette_123.pdf')

      mockPrismaClient.propertyEnergy.update.mockResolvedValue({
        ...mockPropertyEnergy,
        labelPdfUrl: 'https://storage.example.com/labels/REF-001_etiquette_123.pdf',
      })

      const request = createMockRequest({ pdf: createMockFile(), propertyId: 'prop-123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.pdfUrl).toBe('https://storage.example.com/labels/REF-001_etiquette_123.pdf')
      expect(mockUploadToStorage).toHaveBeenCalledWith(
        'labels',
        expect.stringContaining('REF-001_etiquette_'),
        expect.any(ArrayBuffer),
        'application/pdf'
      )
    })

    it('devrait créer PropertyEnergy si elle n\'existe pas', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique
        .mockResolvedValueOnce({
          ...mockPropertyBase,
          reference: 'REF-001',
          energy: null,
        })
        .mockResolvedValueOnce({
          ...mockPropertyBase,
          reference: 'REF-001',
          energy: {
            ...mockPropertyEnergy,
            labelPdfUrl: 'https://storage.example.com/labels/test.pdf',
          },
        })

      setUploadSuccess('https://storage.example.com/labels/test.pdf')

      mockPrismaClient.propertyEnergy.create.mockResolvedValue({
        ...mockPropertyEnergy,
        labelPdfUrl: 'https://storage.example.com/labels/test.pdf',
      })

      const request = createMockRequest({ pdf: createMockFile(), propertyId: 'prop-123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(mockPrismaClient.propertyEnergy.create).toHaveBeenCalledWith({
        data: {
          propertyId: 'prop-123',
          labelPdfUrl: expect.any(String),
        },
      })
    })

    it('devrait retourner 500 si upload échoue', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockResolvedValue({
        ...mockPropertyBase,
        reference: 'REF-001',
        energy: mockPropertyEnergy,
      })

      setUploadFailure(new Error('Storage quota exceeded'))

      const request = createMockRequest({ pdf: createMockFile(), propertyId: 'prop-123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Erreur lors de l\'upload du PDF')
    })

    it('devrait retourner les infos de la propriété mise à jour', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique
        .mockResolvedValueOnce({
          ...mockPropertyBase,
          id: 'prop-123',
          reference: 'REF-001',
          energy: mockPropertyEnergy,
        })
        .mockResolvedValueOnce({
          id: 'prop-123',
          reference: 'REF-001',
          energy: {
            ...mockPropertyEnergy,
            labelPdfUrl: 'https://storage.example.com/labels/test.pdf',
          },
        })

      setUploadSuccess('https://storage.example.com/labels/test.pdf')

      mockPrismaClient.propertyEnergy.update.mockResolvedValue({
        ...mockPropertyEnergy,
        labelPdfUrl: 'https://storage.example.com/labels/test.pdf',
      })

      const request = createMockRequest({ pdf: createMockFile(), propertyId: 'prop-123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.property.id).toBe('prop-123')
      expect(data.property.reference).toBe('REF-001')
      expect(data.property.labelPdfUrl).toBe('https://storage.example.com/labels/test.pdf')
    })

    it('devrait retourner 500 en cas d\'erreur générale', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique.mockRejectedValue(new Error('Database error'))

      const request = createMockRequest({ pdf: createMockFile(), propertyId: 'prop-123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Erreur lors de l\'upload du PDF')
    })

    it('devrait utiliser la référence de la propriété pour le nom du fichier', async () => {
      setAuthenticated(true)

      mockPrismaClient.property.findUnique
        .mockResolvedValueOnce({
          ...mockPropertyBase,
          reference: 'CUSTOM-REF-123',
          energy: mockPropertyEnergy,
        })
        .mockResolvedValueOnce({
          ...mockPropertyBase,
          reference: 'CUSTOM-REF-123',
          energy: mockPropertyEnergy,
        })

      setUploadSuccess('https://storage.example.com/labels/test.pdf')

      mockPrismaClient.propertyEnergy.update.mockResolvedValue(mockPropertyEnergy)

      const request = createMockRequest({ pdf: createMockFile(), propertyId: 'prop-123' })
      await POST(request)

      expect(mockUploadToStorage).toHaveBeenCalledWith(
        'labels',
        expect.stringContaining('CUSTOM-REF-123_etiquette_'),
        expect.any(ArrayBuffer),
        'application/pdf'
      )
    })
  })
})
