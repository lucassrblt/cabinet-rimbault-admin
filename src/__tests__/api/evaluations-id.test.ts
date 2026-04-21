import { describe, it, expect, beforeEach } from 'vitest'

import { mockPrismaClient, resetPrismaMocks } from '../mocks/prisma'
import { setAuthenticated, resetAuthMocks } from '../mocks/auth'
import { mockEvaluation } from '../mocks/fixtures'

import { GET, PATCH, DELETE } from '@/app/api/evaluations/[id]/route'

const paramsOf = (id: string) => ({ params: Promise.resolve({ id }) })

describe('/api/evaluations/[id]', () => {
  beforeEach(() => {
    resetPrismaMocks()
    resetAuthMocks()
  })

  describe('GET', () => {
    it('retourne 401 si non authentifié', async () => {
      setAuthenticated(false)
      const request = new Request('http://localhost:3000/api/evaluations/eval-123')
      const response = await GET(request, paramsOf('eval-123'))
      expect(response.status).toBe(401)
    })

    it('retourne l\'évaluation trouvée', async () => {
      setAuthenticated(true)
      mockPrismaClient.evaluation.findUnique.mockResolvedValue(mockEvaluation)

      const request = new Request('http://localhost:3000/api/evaluations/eval-123')
      const response = await GET(request, paramsOf('eval-123'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.id).toBe('eval-123')
    })

    it('retourne 404 si l\'évaluation est introuvable', async () => {
      setAuthenticated(true)
      mockPrismaClient.evaluation.findUnique.mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/evaluations/missing')
      const response = await GET(request, paramsOf('missing'))
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Demande d\'estimation introuvable')
    })

    it('retourne 500 si Prisma rejette', async () => {
      setAuthenticated(true)
      mockPrismaClient.evaluation.findUnique.mockRejectedValue(new Error('DB'))

      const request = new Request('http://localhost:3000/api/evaluations/eval-123')
      const response = await GET(request, paramsOf('eval-123'))
      expect(response.status).toBe(500)
    })
  })

  describe('PATCH', () => {
    it('retourne 401 si non authentifié', async () => {
      setAuthenticated(false)
      const request = new Request('http://localhost:3000/api/evaluations/eval-123', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'EN_COURS' }),
      })
      const response = await PATCH(request, paramsOf('eval-123'))
      expect(response.status).toBe(401)
    })

    it('met à jour le status valide', async () => {
      setAuthenticated(true)
      mockPrismaClient.evaluation.findUnique.mockResolvedValue(mockEvaluation)
      mockPrismaClient.evaluation.update.mockResolvedValue({
        ...mockEvaluation,
        status: 'EN_COURS',
      })

      const request = new Request('http://localhost:3000/api/evaluations/eval-123', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'EN_COURS', notes: 'Contacté le client' }),
      })
      const response = await PATCH(request, paramsOf('eval-123'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('EN_COURS')
      expect(mockPrismaClient.evaluation.update).toHaveBeenCalledWith({
        where: { id: 'eval-123' },
        data: { status: 'EN_COURS', notes: 'Contacté le client' },
      })
    })

    it('ignore silencieusement un status invalide', async () => {
      setAuthenticated(true)
      mockPrismaClient.evaluation.findUnique.mockResolvedValue(mockEvaluation)
      mockPrismaClient.evaluation.update.mockResolvedValue(mockEvaluation)

      const request = new Request('http://localhost:3000/api/evaluations/eval-123', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'INVALID_STATUS' }),
      })
      await PATCH(request, paramsOf('eval-123'))

      expect(mockPrismaClient.evaluation.update).toHaveBeenCalledWith({
        where: { id: 'eval-123' },
        data: {},
      })
    })

    it('retourne 404 si l\'évaluation n\'existe pas', async () => {
      setAuthenticated(true)
      mockPrismaClient.evaluation.findUnique.mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/evaluations/missing', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'EN_COURS' }),
      })
      const response = await PATCH(request, paramsOf('missing'))
      expect(response.status).toBe(404)
    })

    it('retourne 500 si update rejette', async () => {
      setAuthenticated(true)
      mockPrismaClient.evaluation.findUnique.mockResolvedValue(mockEvaluation)
      mockPrismaClient.evaluation.update.mockRejectedValue(new Error('DB'))

      const request = new Request('http://localhost:3000/api/evaluations/eval-123', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'EN_COURS' }),
      })
      const response = await PATCH(request, paramsOf('eval-123'))
      expect(response.status).toBe(500)
    })
  })

  describe('DELETE', () => {
    it('retourne 401 si non authentifié', async () => {
      setAuthenticated(false)
      const request = new Request('http://localhost:3000/api/evaluations/eval-123', {
        method: 'DELETE',
      })
      const response = await DELETE(request, paramsOf('eval-123'))
      expect(response.status).toBe(401)
    })

    it('supprime une évaluation existante', async () => {
      setAuthenticated(true)
      mockPrismaClient.evaluation.findUnique.mockResolvedValue(mockEvaluation)
      mockPrismaClient.evaluation.delete.mockResolvedValue(mockEvaluation)

      const request = new Request('http://localhost:3000/api/evaluations/eval-123', {
        method: 'DELETE',
      })
      const response = await DELETE(request, paramsOf('eval-123'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockPrismaClient.evaluation.delete).toHaveBeenCalledWith({
        where: { id: 'eval-123' },
      })
    })

    it('retourne 404 si l\'évaluation n\'existe pas', async () => {
      setAuthenticated(true)
      mockPrismaClient.evaluation.findUnique.mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/evaluations/missing', {
        method: 'DELETE',
      })
      const response = await DELETE(request, paramsOf('missing'))
      expect(response.status).toBe(404)
    })

    it('retourne 500 si delete rejette', async () => {
      setAuthenticated(true)
      mockPrismaClient.evaluation.findUnique.mockResolvedValue(mockEvaluation)
      mockPrismaClient.evaluation.delete.mockRejectedValue(new Error('DB'))

      const request = new Request('http://localhost:3000/api/evaluations/eval-123', {
        method: 'DELETE',
      })
      const response = await DELETE(request, paramsOf('eval-123'))
      expect(response.status).toBe(500)
    })
  })
})
