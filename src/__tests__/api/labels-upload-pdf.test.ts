import { describe, it, expect, beforeEach, vi } from 'vitest'

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
  mockPropertyDocument,
} from '../mocks/fixtures'

import { POST } from '@/app/api/labels/upload-pdf/route'

describe('/api/labels/upload-pdf', () => {
  beforeEach(() => {
    resetPrismaMocks()
    resetAuthMocks()
    resetSupabaseMocks()
  })

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

  it('retourne 401 si non authentifié', async () => {
    setAuthenticated(false)

    const response = await POST(
      createMockRequest({ pdf: createMockFile(), propertyId: 'prop-123' })
    )
    expect(response.status).toBe(401)
  })

  it('retourne 400 si pas de fichier PDF', async () => {
    setAuthenticated(true)

    const response = await POST(createMockRequest({ pdf: null, propertyId: 'prop-123' }))
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.error).toBe('Fichier PDF requis')
  })

  it('retourne 400 si pas de propertyId', async () => {
    setAuthenticated(true)

    const response = await POST(createMockRequest({ pdf: createMockFile(), propertyId: null }))
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.error).toBe('ID de propriété requis')
  })

  it('retourne 404 si la propriété est introuvable', async () => {
    setAuthenticated(true)
    mockPrismaClient.property.findUnique.mockResolvedValue(null)

    const response = await POST(
      createMockRequest({ pdf: createMockFile(), propertyId: 'missing' })
    )
    const data = await response.json()
    expect(response.status).toBe(404)
    expect(data.error).toBe('Annonce non trouvée')
  })

  it('upload dans property-files et enregistre le document LABEL_PDF', async () => {
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
        documents: [{ ...mockPropertyDocument, url: 'https://storage.example.com/labels/test.pdf' }],
      })

    setUploadSuccess('https://storage.example.com/labels/test.pdf')
    mockPrismaClient.propertyDocument.deleteMany.mockResolvedValue({ count: 0 })
    mockPrismaClient.propertyDocument.create.mockResolvedValue(mockPropertyDocument)

    const response = await POST(
      createMockRequest({ pdf: createMockFile(), propertyId: 'prop-123' })
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.pdfUrl).toBe('https://storage.example.com/labels/test.pdf')
    expect(mockUploadToStorage).toHaveBeenCalledWith(
      'property-files',
      expect.stringContaining('REF-001/labels/REF-001_etiquette_'),
      expect.any(ArrayBuffer),
      'application/pdf'
    )
    expect(mockPrismaClient.propertyDocument.deleteMany).toHaveBeenCalledWith({
      where: { propertyId: 'prop-123', type: 'LABEL_PDF' },
    })
    expect(mockPrismaClient.propertyDocument.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          propertyId: 'prop-123',
          type: 'LABEL_PDF',
          url: 'https://storage.example.com/labels/test.pdf',
          mimeType: 'application/pdf',
        }),
      })
    )
  })

  it('retourne 500 si upload échoue', async () => {
    setAuthenticated(true)
    mockPrismaClient.property.findUnique.mockResolvedValue({
      ...mockPropertyBase,
      reference: 'REF-001',
      energy: mockPropertyEnergy,
    })
    setUploadFailure(new Error('Storage quota exceeded'))

    const response = await POST(
      createMockRequest({ pdf: createMockFile(), propertyId: 'prop-123' })
    )
    const data = await response.json()
    expect(response.status).toBe(500)
    expect(data.error).toBe('Erreur lors de l\'upload du PDF')
  })

  it('retourne 500 en cas d\'erreur générale', async () => {
    setAuthenticated(true)
    mockPrismaClient.property.findUnique.mockRejectedValue(new Error('DB'))

    const response = await POST(
      createMockRequest({ pdf: createMockFile(), propertyId: 'prop-123' })
    )
    const data = await response.json()
    expect(response.status).toBe(500)
    expect(data.error).toBe('Erreur lors de l\'upload du PDF')
  })

  it('utilise la référence de la propriété pour le nom du fichier', async () => {
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
        documents: [],
      })

    setUploadSuccess('https://storage.example.com/labels/test.pdf')
    mockPrismaClient.propertyDocument.deleteMany.mockResolvedValue({ count: 0 })
    mockPrismaClient.propertyDocument.create.mockResolvedValue(mockPropertyDocument)

    await POST(createMockRequest({ pdf: createMockFile(), propertyId: 'prop-123' }))

    expect(mockUploadToStorage).toHaveBeenCalledWith(
      'property-files',
      expect.stringContaining('CUSTOM-REF-123/labels/CUSTOM-REF-123_etiquette_'),
      expect.any(ArrayBuffer),
      'application/pdf'
    )
  })
})
