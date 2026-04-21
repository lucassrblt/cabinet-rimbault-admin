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

import { POST } from '@/app/api/descriptive-sheets/upload-pdf/route'
import { NextRequest } from 'next/server'

function createMockFile(): File {
  const buffer = new ArrayBuffer(1024)
  return {
    name: 'sheet.pdf',
    type: 'application/pdf',
    size: 1024,
    arrayBuffer: () => Promise.resolve(buffer),
  } as unknown as File
}

function buildRequest(values: { pdf?: File | null; propertyId?: string | null }): NextRequest {
  const formDataMap = new Map<string, unknown>()
  if (values.pdf !== undefined) formDataMap.set('pdf', values.pdf)
  if (values.propertyId !== undefined) formDataMap.set('propertyId', values.propertyId)

  return {
    formData: vi.fn().mockResolvedValue({
      get: (key: string) => formDataMap.get(key) ?? null,
    }),
  } as unknown as NextRequest
}

describe('/api/descriptive-sheets/upload-pdf', () => {
  beforeEach(() => {
    resetPrismaMocks()
    resetAuthMocks()
    resetSupabaseMocks()
  })

  it('retourne 401 si non authentifié', async () => {
    setAuthenticated(false)
    const response = await POST(buildRequest({ pdf: createMockFile(), propertyId: 'prop-123' }))
    expect(response.status).toBe(401)
  })

  it('retourne 400 si pdf ou propertyId manque', async () => {
    setAuthenticated(true)
    const response = await POST(buildRequest({ pdf: null, propertyId: 'prop-123' }))
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.error).toBe('Fichier PDF et ID de propriété requis')
  })

  it('retourne 400 si formData est invalide', async () => {
    setAuthenticated(true)
    const req = {
      formData: vi.fn().mockRejectedValue(new Error('parse error')),
    } as unknown as NextRequest
    const response = await POST(req)
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.error).toBe('Erreur lors du parsing du fichier')
  })

  it('retourne 404 si la propriété est introuvable', async () => {
    setAuthenticated(true)
    mockPrismaClient.property.findUnique.mockResolvedValue(null)

    const response = await POST(buildRequest({ pdf: createMockFile(), propertyId: 'missing' }))
    const data = await response.json()
    expect(response.status).toBe(404)
    expect(data.error).toBe('Propriété non trouvée')
  })

  it('upload le PDF, enregistre le document et met à jour energy', async () => {
    setAuthenticated(true)
    mockPrismaClient.property.findUnique.mockResolvedValue({
      ...mockPropertyBase,
      reference: 'REF-001',
      energy: mockPropertyEnergy,
    })
    setUploadSuccess('https://s.co/descriptive.pdf')
    mockPrismaClient.propertyDocument.deleteMany.mockResolvedValue({ count: 0 })
    mockPrismaClient.propertyDocument.create.mockResolvedValue(mockPropertyDocument)
    mockPrismaClient.propertyEnergy.update.mockResolvedValue({
      ...mockPropertyEnergy,
      descriptiveSheetGenerated: true,
    })

    const response = await POST(buildRequest({ pdf: createMockFile(), propertyId: 'prop-123' }))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.pdfUrl).toBe('https://s.co/descriptive.pdf')
    expect(mockUploadToStorage).toHaveBeenCalledWith(
      'property-files',
      expect.stringMatching(/^REF-001\/descriptive-sheet\/\d+_fiche_descriptive\.pdf$/),
      expect.any(Buffer),
      'application/pdf'
    )
    expect(mockPrismaClient.propertyDocument.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          propertyId: 'prop-123',
          type: 'DESCRIPTIVE_SHEET_PDF',
        }),
      })
    )
    expect(mockPrismaClient.propertyEnergy.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: mockPropertyEnergy.id },
        data: expect.objectContaining({ descriptiveSheetGenerated: true }),
      })
    )
  })

  it('crée un PropertyEnergy si aucun n\'existe', async () => {
    setAuthenticated(true)
    mockPrismaClient.property.findUnique.mockResolvedValue({
      ...mockPropertyBase,
      id: 'prop-123',
      reference: 'REF-001',
      energy: null,
    })
    setUploadSuccess('https://s.co/descriptive.pdf')
    mockPrismaClient.propertyDocument.deleteMany.mockResolvedValue({ count: 0 })
    mockPrismaClient.propertyDocument.create.mockResolvedValue(mockPropertyDocument)
    mockPrismaClient.propertyEnergy.create.mockResolvedValue({
      ...mockPropertyEnergy,
      descriptiveSheetGenerated: true,
    })

    const response = await POST(buildRequest({ pdf: createMockFile(), propertyId: 'prop-123' }))
    expect(response.status).toBe(200)
    expect(mockPrismaClient.propertyEnergy.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          propertyId: 'prop-123',
          descriptiveSheetGenerated: true,
        }),
      })
    )
  })

  it('retourne 500 si l\'upload échoue', async () => {
    setAuthenticated(true)
    mockPrismaClient.property.findUnique.mockResolvedValue({
      ...mockPropertyBase,
      reference: 'REF-001',
      energy: mockPropertyEnergy,
    })
    setUploadFailure(new Error('Bucket error'))

    const response = await POST(buildRequest({ pdf: createMockFile(), propertyId: 'prop-123' }))
    const data = await response.json()
    expect(response.status).toBe(500)
    expect(data.error).toContain('Erreur lors de l\'upload du PDF')
  })

  it('retourne 500 si Prisma rejette', async () => {
    setAuthenticated(true)
    mockPrismaClient.property.findUnique.mockRejectedValue(new Error('DB'))

    const response = await POST(buildRequest({ pdf: createMockFile(), propertyId: 'prop-123' }))
    const data = await response.json()
    expect(response.status).toBe(500)
    expect(data.error).toBe('Erreur serveur lors de l\'upload')
  })
})
