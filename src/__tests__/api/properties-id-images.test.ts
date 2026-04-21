import { describe, it, expect, beforeEach } from 'vitest'

import { mockPrismaClient, resetPrismaMocks } from '../mocks/prisma'
import { setAuthenticated, resetAuthMocks } from '../mocks/auth'
import {
  mockDeleteFromStorage,
  resetSupabaseMocks,
} from '../mocks/supabase'
import { mockPropertyImages } from '../mocks/fixtures'

import { GET, POST, DELETE, PATCH } from '@/app/api/properties/[id]/images/route'

const paramsOf = (id: string) => ({ params: Promise.resolve({ id }) })

describe('/api/properties/[id]/images', () => {
  beforeEach(() => {
    resetPrismaMocks()
    resetAuthMocks()
    resetSupabaseMocks()
  })

  describe('GET', () => {
    it('retourne 401 si non authentifié', async () => {
      setAuthenticated(false)
      const req = new Request('http://localhost:3000/api/properties/prop-123/images')
      const response = await GET(req, paramsOf('prop-123'))
      expect(response.status).toBe(401)
    })

    it('retourne les images triées par order', async () => {
      setAuthenticated(true)
      mockPrismaClient.propertyImage.findMany.mockResolvedValue(mockPropertyImages)

      const req = new Request('http://localhost:3000/api/properties/prop-123/images')
      const response = await GET(req, paramsOf('prop-123'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(2)
      expect(mockPrismaClient.propertyImage.findMany).toHaveBeenCalledWith({
        where: { propertyId: 'prop-123' },
        orderBy: { order: 'asc' },
      })
    })

    it('retourne 500 si Prisma rejette', async () => {
      setAuthenticated(true)
      mockPrismaClient.propertyImage.findMany.mockRejectedValue(new Error('DB'))

      const req = new Request('http://localhost:3000/api/properties/prop-123/images')
      const response = await GET(req, paramsOf('prop-123'))
      expect(response.status).toBe(500)
    })
  })

  describe('POST', () => {
    it('retourne 401 si non authentifié', async () => {
      setAuthenticated(false)
      const req = new Request('http://localhost:3000/api/properties/prop-123/images', {
        method: 'POST',
        body: JSON.stringify({ images: [{ url: 'u' }] }),
      })
      const response = await POST(req, paramsOf('prop-123'))
      expect(response.status).toBe(401)
    })

    it('retourne 400 si aucune image n\'est fournie', async () => {
      setAuthenticated(true)
      const req = new Request('http://localhost:3000/api/properties/prop-123/images', {
        method: 'POST',
        body: JSON.stringify({ images: [] }),
      })
      const response = await POST(req, paramsOf('prop-123'))
      const data = await response.json()
      expect(response.status).toBe(400)
      expect(data.error).toBe('Aucune image fournie')
    })

    it('retourne 404 si la propriété n\'existe pas', async () => {
      setAuthenticated(true)
      mockPrismaClient.property.findUnique.mockResolvedValue(null)

      const req = new Request('http://localhost:3000/api/properties/prop-123/images', {
        method: 'POST',
        body: JSON.stringify({ images: [{ url: 'https://x.jpg' }] }),
      })
      const response = await POST(req, paramsOf('prop-123'))
      const data = await response.json()
      expect(response.status).toBe(404)
      expect(data.error).toBe('Annonce non trouvée')
    })

    it('crée les images et marque la première comme principale si aucune existante', async () => {
      setAuthenticated(true)
      mockPrismaClient.property.findUnique.mockResolvedValue({ id: 'prop-123', images: [] })
      mockPrismaClient.propertyImage.create.mockImplementation(async (args: { data: Record<string, unknown> }) => ({
        id: 'img-new',
        ...args.data,
      }))

      const req = new Request('http://localhost:3000/api/properties/prop-123/images', {
        method: 'POST',
        body: JSON.stringify({
          images: [
            { url: 'https://x.jpg', alt: 'A', size: 1000 },
            { url: 'https://y.jpg', filename: 'y.jpg', size: 2000 },
          ],
        }),
      })
      const response = await POST(req, paramsOf('prop-123'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.uploaded).toBe(2)
      // Première image: isMain: true
      expect(mockPrismaClient.propertyImage.create.mock.calls[0][0].data).toMatchObject({
        url: 'https://x.jpg',
        order: 0,
        isMain: true,
        propertyId: 'prop-123',
      })
      // Deuxième image: isMain: false
      expect(mockPrismaClient.propertyImage.create.mock.calls[1][0].data).toMatchObject({
        url: 'https://y.jpg',
        order: 1,
        isMain: false,
      })
      // filename → alt
      expect(mockPrismaClient.propertyImage.create.mock.calls[1][0].data.alt).toBe('y')
    })

    it('limite à 20 images par propriété', async () => {
      setAuthenticated(true)
      mockPrismaClient.property.findUnique.mockResolvedValue({
        id: 'prop-123',
        images: Array.from({ length: 18 }, (_, i) => ({ id: `img-${i}` })),
      })
      mockPrismaClient.propertyImage.create.mockImplementation(async (args: { data: Record<string, unknown> }) => ({
        id: 'img-new',
        ...args.data,
      }))

      const req = new Request('http://localhost:3000/api/properties/prop-123/images', {
        method: 'POST',
        body: JSON.stringify({
          images: Array.from({ length: 5 }, (_, i) => ({ url: `https://${i}.jpg` })),
        }),
      })
      await POST(req, paramsOf('prop-123'))

      // Max 2 images créables
      expect(mockPrismaClient.propertyImage.create).toHaveBeenCalledTimes(2)
    })
  })

  describe('DELETE', () => {
    it('retourne 401 si non authentifié', async () => {
      setAuthenticated(false)
      const req = new Request(
        'http://localhost:3000/api/properties/prop-123/images?imageId=img-1',
        { method: 'DELETE' }
      )
      const response = await DELETE(req, paramsOf('prop-123'))
      expect(response.status).toBe(401)
    })

    it('retourne 400 si imageId manque', async () => {
      setAuthenticated(true)
      const req = new Request('http://localhost:3000/api/properties/prop-123/images', {
        method: 'DELETE',
      })
      const response = await DELETE(req, paramsOf('prop-123'))
      const data = await response.json()
      expect(response.status).toBe(400)
      expect(data.error).toBe('ID de l\'image requis')
    })

    it('retourne 404 si l\'image n\'existe pas', async () => {
      setAuthenticated(true)
      mockPrismaClient.propertyImage.findUnique.mockResolvedValue(null)

      const req = new Request(
        'http://localhost:3000/api/properties/prop-123/images?imageId=missing',
        { method: 'DELETE' }
      )
      const response = await DELETE(req, paramsOf('prop-123'))
      expect(response.status).toBe(404)
    })

    it('retourne 404 si l\'image appartient à une autre propriété', async () => {
      setAuthenticated(true)
      mockPrismaClient.propertyImage.findUnique.mockResolvedValue({
        id: 'img-1',
        propertyId: 'other-prop',
        url: 'https://x.jpg',
        isMain: false,
      })

      const req = new Request(
        'http://localhost:3000/api/properties/prop-123/images?imageId=img-1',
        { method: 'DELETE' }
      )
      const response = await DELETE(req, paramsOf('prop-123'))
      expect(response.status).toBe(404)
    })

    it('supprime l\'image du storage et de la base', async () => {
      setAuthenticated(true)
      mockPrismaClient.propertyImage.findUnique.mockResolvedValue({
        id: 'img-1',
        propertyId: 'prop-123',
        url: 'https://s.co/property-files/REF-001/images/file.jpg',
        isMain: false,
      })
      mockDeleteFromStorage.mockResolvedValue({ success: true, error: null })
      mockPrismaClient.propertyImage.delete.mockResolvedValue({})

      const req = new Request(
        'http://localhost:3000/api/properties/prop-123/images?imageId=img-1',
        { method: 'DELETE' }
      )
      const response = await DELETE(req, paramsOf('prop-123'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockDeleteFromStorage).toHaveBeenCalledWith(
        'property-files',
        'REF-001/images/file.jpg'
      )
      expect(mockPrismaClient.propertyImage.delete).toHaveBeenCalledWith({
        where: { id: 'img-1' },
      })
    })

    it('réassigne isMain si l\'image principale est supprimée', async () => {
      setAuthenticated(true)
      mockPrismaClient.propertyImage.findUnique.mockResolvedValue({
        id: 'img-1',
        propertyId: 'prop-123',
        url: 'https://s.co/property-files/REF-001/images/main.jpg',
        isMain: true,
      })
      mockDeleteFromStorage.mockResolvedValue({ success: true, error: null })
      mockPrismaClient.propertyImage.delete.mockResolvedValue({})
      mockPrismaClient.propertyImage.findMany.mockResolvedValue([
        { id: 'img-2' },
      ])
      mockPrismaClient.propertyImage.update.mockResolvedValue({})

      const req = new Request(
        'http://localhost:3000/api/properties/prop-123/images?imageId=img-1',
        { method: 'DELETE' }
      )
      await DELETE(req, paramsOf('prop-123'))

      expect(mockPrismaClient.propertyImage.update).toHaveBeenCalledWith({
        where: { id: 'img-2' },
        data: { isMain: true },
      })
    })
  })

  describe('PATCH', () => {
    it('retourne 401 si non authentifié', async () => {
      setAuthenticated(false)
      const req = new Request('http://localhost:3000/api/properties/prop-123/images', {
        method: 'PATCH',
        body: JSON.stringify({ imageId: 'img-1', order: 3 }),
      })
      const response = await PATCH(req, paramsOf('prop-123'))
      expect(response.status).toBe(401)
    })

    it('retourne 400 si imageId manque', async () => {
      setAuthenticated(true)
      const req = new Request('http://localhost:3000/api/properties/prop-123/images', {
        method: 'PATCH',
        body: JSON.stringify({ order: 3 }),
      })
      const response = await PATCH(req, paramsOf('prop-123'))
      expect(response.status).toBe(400)
    })

    it('retourne 404 si image introuvable', async () => {
      setAuthenticated(true)
      mockPrismaClient.propertyImage.findUnique.mockResolvedValue(null)

      const req = new Request('http://localhost:3000/api/properties/prop-123/images', {
        method: 'PATCH',
        body: JSON.stringify({ imageId: 'missing', order: 3 }),
      })
      const response = await PATCH(req, paramsOf('prop-123'))
      expect(response.status).toBe(404)
    })

    it('met à jour l\'ordre sans toucher à isMain', async () => {
      setAuthenticated(true)
      mockPrismaClient.propertyImage.findUnique.mockResolvedValue({
        id: 'img-1',
        propertyId: 'prop-123',
      })
      mockPrismaClient.propertyImage.update.mockResolvedValue({ id: 'img-1', order: 3 })

      const req = new Request('http://localhost:3000/api/properties/prop-123/images', {
        method: 'PATCH',
        body: JSON.stringify({ imageId: 'img-1', order: 3 }),
      })
      const response = await PATCH(req, paramsOf('prop-123'))
      expect(response.status).toBe(200)
      expect(mockPrismaClient.propertyImage.updateMany).not.toHaveBeenCalled()
      expect(mockPrismaClient.propertyImage.update).toHaveBeenCalledWith({
        where: { id: 'img-1' },
        data: { order: 3 },
      })
    })

    it('définit une nouvelle image principale et retire l\'ancienne', async () => {
      setAuthenticated(true)
      mockPrismaClient.propertyImage.findUnique.mockResolvedValue({
        id: 'img-1',
        propertyId: 'prop-123',
      })
      mockPrismaClient.propertyImage.updateMany.mockResolvedValue({ count: 1 })
      mockPrismaClient.propertyImage.update.mockResolvedValue({ id: 'img-1', isMain: true })

      const req = new Request('http://localhost:3000/api/properties/prop-123/images', {
        method: 'PATCH',
        body: JSON.stringify({ imageId: 'img-1', isMain: true }),
      })
      const response = await PATCH(req, paramsOf('prop-123'))
      expect(response.status).toBe(200)
      expect(mockPrismaClient.propertyImage.updateMany).toHaveBeenCalledWith({
        where: { propertyId: 'prop-123', isMain: true },
        data: { isMain: false },
      })
    })
  })
})
