import { describe, it, expect, beforeEach } from 'vitest'

import { mockPrismaClient, resetPrismaMocks } from '../mocks/prisma'
import { setAuthenticated, resetAuthMocks } from '../mocks/auth'
import { mockLead } from '../mocks/fixtures'

import { GET, PATCH, DELETE } from '@/app/api/leads/[id]/route'

const paramsOf = (id: string) => ({ params: Promise.resolve({ id }) })

describe('/api/leads/[id]', () => {
  beforeEach(() => {
    resetPrismaMocks()
    resetAuthMocks()
  })

  describe('GET', () => {
    it('retourne 401 si non authentifié', async () => {
      setAuthenticated(false)
      const request = new Request('http://localhost:3000/api/leads/lead-123')
      const response = await GET(request, paramsOf('lead-123'))
      expect(response.status).toBe(401)
    })

    it('retourne le lead trouvé', async () => {
      setAuthenticated(true)
      mockPrismaClient.lead.findUnique.mockResolvedValue(mockLead)

      const request = new Request('http://localhost:3000/api/leads/lead-123')
      const response = await GET(request, paramsOf('lead-123'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.id).toBe('lead-123')
    })

    it('retourne 404 si le lead est introuvable', async () => {
      setAuthenticated(true)
      mockPrismaClient.lead.findUnique.mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/leads/missing')
      const response = await GET(request, paramsOf('missing'))
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Lead introuvable')
    })

    it('retourne 500 si Prisma rejette', async () => {
      setAuthenticated(true)
      mockPrismaClient.lead.findUnique.mockRejectedValue(new Error('DB'))

      const request = new Request('http://localhost:3000/api/leads/lead-123')
      const response = await GET(request, paramsOf('lead-123'))
      expect(response.status).toBe(500)
    })
  })

  describe('PATCH', () => {
    it('retourne 401 si non authentifié', async () => {
      setAuthenticated(false)
      const request = new Request('http://localhost:3000/api/leads/lead-123', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'EN_COURS' }),
      })
      const response = await PATCH(request, paramsOf('lead-123'))
      expect(response.status).toBe(401)
    })

    it('met à jour le status valide', async () => {
      setAuthenticated(true)
      mockPrismaClient.lead.findUnique.mockResolvedValue(mockLead)
      mockPrismaClient.lead.update.mockResolvedValue({
        ...mockLead,
        status: 'EN_COURS',
      })

      const request = new Request('http://localhost:3000/api/leads/lead-123', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'EN_COURS', notes: 'Contacté le client' }),
      })
      const response = await PATCH(request, paramsOf('lead-123'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('EN_COURS')
      expect(mockPrismaClient.lead.update).toHaveBeenCalledWith({
        where: { id: 'lead-123' },
        data: { status: 'EN_COURS', notes: 'Contacté le client' },
      })
    })

    it('ignore silencieusement un status invalide', async () => {
      setAuthenticated(true)
      mockPrismaClient.lead.findUnique.mockResolvedValue(mockLead)
      mockPrismaClient.lead.update.mockResolvedValue(mockLead)

      const request = new Request('http://localhost:3000/api/leads/lead-123', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'INVALID_STATUS' }),
      })
      await PATCH(request, paramsOf('lead-123'))

      expect(mockPrismaClient.lead.update).toHaveBeenCalledWith({
        where: { id: 'lead-123' },
        data: {},
      })
    })

    it('retourne 404 si le lead n\'existe pas', async () => {
      setAuthenticated(true)
      mockPrismaClient.lead.findUnique.mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/leads/missing', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'EN_COURS' }),
      })
      const response = await PATCH(request, paramsOf('missing'))
      expect(response.status).toBe(404)
    })

    it('retourne 500 si update rejette', async () => {
      setAuthenticated(true)
      mockPrismaClient.lead.findUnique.mockResolvedValue(mockLead)
      mockPrismaClient.lead.update.mockRejectedValue(new Error('DB'))

      const request = new Request('http://localhost:3000/api/leads/lead-123', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'EN_COURS' }),
      })
      const response = await PATCH(request, paramsOf('lead-123'))
      expect(response.status).toBe(500)
    })
  })

  describe('DELETE', () => {
    it('retourne 401 si non authentifié', async () => {
      setAuthenticated(false)
      const request = new Request('http://localhost:3000/api/leads/lead-123', {
        method: 'DELETE',
      })
      const response = await DELETE(request, paramsOf('lead-123'))
      expect(response.status).toBe(401)
    })

    it('supprime un lead existant', async () => {
      setAuthenticated(true)
      mockPrismaClient.lead.findUnique.mockResolvedValue(mockLead)
      mockPrismaClient.lead.delete.mockResolvedValue(mockLead)

      const request = new Request('http://localhost:3000/api/leads/lead-123', {
        method: 'DELETE',
      })
      const response = await DELETE(request, paramsOf('lead-123'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockPrismaClient.lead.delete).toHaveBeenCalledWith({
        where: { id: 'lead-123' },
      })
    })

    it('retourne 404 si le lead n\'existe pas', async () => {
      setAuthenticated(true)
      mockPrismaClient.lead.findUnique.mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/leads/missing', {
        method: 'DELETE',
      })
      const response = await DELETE(request, paramsOf('missing'))
      expect(response.status).toBe(404)
    })

    it('retourne 500 si delete rejette', async () => {
      setAuthenticated(true)
      mockPrismaClient.lead.findUnique.mockResolvedValue(mockLead)
      mockPrismaClient.lead.delete.mockRejectedValue(new Error('DB'))

      const request = new Request('http://localhost:3000/api/leads/lead-123', {
        method: 'DELETE',
      })
      const response = await DELETE(request, paramsOf('lead-123'))
      expect(response.status).toBe(500)
    })
  })
})
