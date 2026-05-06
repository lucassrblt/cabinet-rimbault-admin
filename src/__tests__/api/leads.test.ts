import { describe, it, expect, beforeEach } from 'vitest'

import { mockPrismaClient, resetPrismaMocks } from '../mocks/prisma'
import { setAuthenticated, resetAuthMocks } from '../mocks/auth'
import { mockLead } from '../mocks/fixtures'

import { GET } from '@/app/api/leads/route'

describe('/api/leads', () => {
  beforeEach(() => {
    resetPrismaMocks()
    resetAuthMocks()
  })

  describe('GET /api/leads', () => {
    it('devrait retourner 401 si non authentifié', async () => {
      setAuthenticated(false)

      const request = new Request('http://localhost:3000/api/leads')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Non autorisé. Veuillez vous connecter.')
    })

    it('devrait retourner la liste des leads', async () => {
      setAuthenticated(true)
      mockPrismaClient.lead.findMany.mockResolvedValue([mockLead])

      const request = new Request('http://localhost:3000/api/leads')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0].id).toBe('lead-123')
      expect(mockPrismaClient.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
          orderBy: { createdAt: 'desc' },
        })
      )
    })

    it('devrait filtrer par status', async () => {
      setAuthenticated(true)
      mockPrismaClient.lead.findMany.mockResolvedValue([])

      const request = new Request('http://localhost:3000/api/leads?status=NOUVEAU')
      await GET(request)

      expect(mockPrismaClient.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'NOUVEAU' } })
      )
    })

    it('devrait filtrer par subject', async () => {
      setAuthenticated(true)
      mockPrismaClient.lead.findMany.mockResolvedValue([])

      const request = new Request('http://localhost:3000/api/leads?subject=BIEN_SALE')
      await GET(request)

      expect(mockPrismaClient.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { subject: 'BIEN_SALE' } })
      )
    })

    it('devrait combiner les filtres status et subject', async () => {
      setAuthenticated(true)
      mockPrismaClient.lead.findMany.mockResolvedValue([])

      const request = new Request('http://localhost:3000/api/leads?status=NOUVEAU&subject=ESTIMATION')
      await GET(request)

      expect(mockPrismaClient.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'NOUVEAU', subject: 'ESTIMATION' },
        })
      )
    })

    it('devrait ignorer le filtre status=all', async () => {
      setAuthenticated(true)
      mockPrismaClient.lead.findMany.mockResolvedValue([])

      const request = new Request('http://localhost:3000/api/leads?status=all')
      await GET(request)

      expect(mockPrismaClient.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} })
      )
    })

    it('devrait ignorer le filtre subject=all', async () => {
      setAuthenticated(true)
      mockPrismaClient.lead.findMany.mockResolvedValue([])

      const request = new Request('http://localhost:3000/api/leads?subject=all')
      await GET(request)

      expect(mockPrismaClient.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} })
      )
    })

    it('devrait retourner 500 si Prisma rejette', async () => {
      setAuthenticated(true)
      mockPrismaClient.lead.findMany.mockRejectedValue(new Error('DB error'))

      const request = new Request('http://localhost:3000/api/leads')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Erreur lors de la récupération des leads')
    })
  })
})
