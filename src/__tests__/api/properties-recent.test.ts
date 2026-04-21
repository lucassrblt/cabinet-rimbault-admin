import { describe, it, expect, beforeEach } from 'vitest'

import { mockPrismaClient, resetPrismaMocks } from '../mocks/prisma'
import { resetAuthMocks } from '../mocks/auth'
import { mockFullProperty } from '../mocks/fixtures'

import { GET, OPTIONS } from '@/app/api/properties/recent/route'

describe('/api/properties/recent', () => {
  beforeEach(() => {
    resetPrismaMocks()
    resetAuthMocks()
  })

  describe('GET /api/properties/recent', () => {
    it('devrait retourner les propriétés publiées', async () => {
      mockPrismaClient.property.findMany.mockResolvedValue([mockFullProperty])

      const request = new Request('http://localhost:3000/api/properties/recent')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(1)
      expect(mockPrismaClient.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isPublished: true },
          orderBy: { createdAt: 'desc' },
          take: 3,
        })
      )
    })

    it('devrait utiliser le paramètre limit', async () => {
      mockPrismaClient.property.findMany.mockResolvedValue([])

      const request = new Request('http://localhost:3000/api/properties/recent?limit=10')
      await GET(request)

      expect(mockPrismaClient.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 })
      )
    })

    it('devrait clamper le limit à 50 max', async () => {
      mockPrismaClient.property.findMany.mockResolvedValue([])

      const request = new Request('http://localhost:3000/api/properties/recent?limit=9999')
      await GET(request)

      expect(mockPrismaClient.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 50 })
      )
    })

    it('devrait clamper le limit à 1 minimum', async () => {
      mockPrismaClient.property.findMany.mockResolvedValue([])

      const request = new Request('http://localhost:3000/api/properties/recent?limit=0')
      await GET(request)

      expect(mockPrismaClient.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 3 })
      )
    })

    it('devrait ajouter les headers CORS pour les origines localhost autorisées', async () => {
      mockPrismaClient.property.findMany.mockResolvedValue([])

      const request = new Request('http://localhost:3000/api/properties/recent', {
        headers: { origin: 'http://localhost:3001' },
      })
      const response = await GET(request)

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3001')
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET')
    })

    it('ne devrait pas ajouter les headers CORS pour une origine non autorisée', async () => {
      mockPrismaClient.property.findMany.mockResolvedValue([])

      const request = new Request('http://localhost:3000/api/properties/recent', {
        headers: { origin: 'https://evil.com' },
      })
      const response = await GET(request)

      expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull()
    })

    it('devrait retourner 500 si Prisma rejette', async () => {
      mockPrismaClient.property.findMany.mockRejectedValue(new Error('DB down'))

      const request = new Request('http://localhost:3000/api/properties/recent')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Erreur lors de la récupération des derniers biens')
    })
  })

  describe('OPTIONS /api/properties/recent', () => {
    it('devrait retourner 200 avec headers CORS pour origine autorisée', async () => {
      const request = new Request('http://localhost:3000/api/properties/recent', {
        method: 'OPTIONS',
        headers: { origin: 'http://localhost:3000' },
      })
      const response = await OPTIONS(request)

      expect(response.status).toBe(200)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000')
    })
  })
})
