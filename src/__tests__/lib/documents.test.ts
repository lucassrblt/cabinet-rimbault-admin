import { describe, it, expect, beforeEach } from 'vitest'

// Import mocks
import { mockPrismaClient, resetPrismaMocks } from '../mocks/prisma'
import {
  mockDeleteStorageObjectByUrl,
  resetSupabaseMocks,
  setStorageDeleteFailure,
} from '../mocks/supabase'

import { upsertPropertyDocument } from '@/lib/documents'

const DPE_URL_OLD =
  'https://demo.supabase.co/storage/v1/object/public/property-files/AP-001/energy/AP-001_dpe_1000.svg'
const DPE_URL_NEW =
  'https://demo.supabase.co/storage/v1/object/public/property-files/AP-001/energy/AP-001_dpe_2000.svg'

describe('upsertPropertyDocument', () => {
  beforeEach(() => {
    resetPrismaMocks()
    resetSupabaseMocks()
    mockPrismaClient.propertyDocument.create.mockResolvedValue({ id: 'doc-new' })
    mockPrismaClient.propertyDocument.deleteMany.mockResolvedValue({ count: 1 })
  })

  it("supprime le fichier Storage de l'ancienne étiquette lors d'une régénération", async () => {
    mockPrismaClient.propertyDocument.findMany.mockResolvedValue([
      { id: 'doc-old', url: DPE_URL_OLD },
    ])

    await upsertPropertyDocument({
      propertyId: 'prop-123',
      type: 'DPE_IMAGE',
      url: DPE_URL_NEW,
      name: 'AP-001_dpe.svg',
    })

    expect(mockPrismaClient.propertyDocument.deleteMany).toHaveBeenCalledWith({
      where: { propertyId: 'prop-123', type: 'DPE_IMAGE' },
    })
    expect(mockDeleteStorageObjectByUrl).toHaveBeenCalledTimes(1)
    expect(mockDeleteStorageObjectByUrl).toHaveBeenCalledWith(DPE_URL_OLD)
    expect(mockPrismaClient.propertyDocument.create).toHaveBeenCalled()
  })

  it("ne supprime pas le fichier que l'on vient d'enregistrer", async () => {
    mockPrismaClient.propertyDocument.findMany.mockResolvedValue([
      { id: 'doc-old', url: DPE_URL_NEW },
    ])

    await upsertPropertyDocument({
      propertyId: 'prop-123',
      type: 'DPE_IMAGE',
      url: DPE_URL_NEW,
      name: 'AP-001_dpe.svg',
    })

    expect(mockDeleteStorageObjectByUrl).not.toHaveBeenCalled()
  })

  it('supprime chaque ancien fichier une seule fois en cas de doublons', async () => {
    mockPrismaClient.propertyDocument.findMany.mockResolvedValue([
      { id: 'doc-a', url: DPE_URL_OLD },
      { id: 'doc-b', url: DPE_URL_OLD },
    ])

    await upsertPropertyDocument({
      propertyId: 'prop-123',
      type: 'DPE_IMAGE',
      url: DPE_URL_NEW,
      name: 'AP-001_dpe.svg',
    })

    expect(mockDeleteStorageObjectByUrl).toHaveBeenCalledTimes(1)
  })

  it("n'échoue pas si la suppression Storage échoue", async () => {
    mockPrismaClient.propertyDocument.findMany.mockResolvedValue([
      { id: 'doc-old', url: DPE_URL_OLD },
    ])
    setStorageDeleteFailure()

    await expect(
      upsertPropertyDocument({
        propertyId: 'prop-123',
        type: 'DPE_IMAGE',
        url: DPE_URL_NEW,
        name: 'AP-001_dpe.svg',
      })
    ).resolves.toBeDefined()

    expect(mockPrismaClient.propertyDocument.create).toHaveBeenCalled()
  })

  it('ne touche pas au Storage pour les types non uniques', async () => {
    await upsertPropertyDocument({
      propertyId: 'prop-123',
      type: 'DIAGNOSTIC_AMIANTE',
      url: DPE_URL_NEW,
      name: 'amiante.pdf',
    })

    expect(mockPrismaClient.propertyDocument.deleteMany).not.toHaveBeenCalled()
    expect(mockDeleteStorageObjectByUrl).not.toHaveBeenCalled()
  })
})
