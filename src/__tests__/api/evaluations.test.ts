import { describe, it, expect, beforeEach } from 'vitest'

import { mockPrismaClient, resetPrismaMocks } from '../mocks/prisma'
import { setAuthenticated, resetAuthMocks } from '../mocks/auth'
import { mockEvaluation, mockCreateEvaluationBody } from '../mocks/fixtures'

import { GET, POST } from '@/app/api/evaluations/route'

describe('/api/evaluations', () => {
  beforeEach(() => {
    resetPrismaMocks()
    resetAuthMocks()
  })

  describe('GET /api/evaluations', () => {
    it('devrait retourner 401 si non authentifié', async () => {
      setAuthenticated(false)

      const request = new Request('http://localhost:3000/api/evaluations')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Non autorisé. Veuillez vous connecter.')
    })

    it('devrait retourner la liste des évaluations', async () => {
      setAuthenticated(true)
      mockPrismaClient.evaluation.findMany.mockResolvedValue([mockEvaluation])

      const request = new Request('http://localhost:3000/api/evaluations')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0].id).toBe('eval-123')
      expect(mockPrismaClient.evaluation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
          orderBy: { createdAt: 'desc' },
        })
      )
    })

    it('devrait filtrer par status', async () => {
      setAuthenticated(true)
      mockPrismaClient.evaluation.findMany.mockResolvedValue([])

      const request = new Request('http://localhost:3000/api/evaluations?status=NOUVELLE')
      await GET(request)

      expect(mockPrismaClient.evaluation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'NOUVELLE' } })
      )
    })

    it('devrait ignorer le filtre status=all', async () => {
      setAuthenticated(true)
      mockPrismaClient.evaluation.findMany.mockResolvedValue([])

      const request = new Request('http://localhost:3000/api/evaluations?status=all')
      await GET(request)

      expect(mockPrismaClient.evaluation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} })
      )
    })

    it('devrait filtrer par postalCode et situation', async () => {
      setAuthenticated(true)
      mockPrismaClient.evaluation.findMany.mockResolvedValue([])

      const request = new Request(
        'http://localhost:3000/api/evaluations?postalCode=75001&situation=VENTE'
      )
      await GET(request)

      expect(mockPrismaClient.evaluation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { postalCode: '75001', situation: 'VENTE' },
        })
      )
    })

    it('devrait retourner 500 si Prisma rejette', async () => {
      setAuthenticated(true)
      mockPrismaClient.evaluation.findMany.mockRejectedValue(new Error('DB error'))

      const request = new Request('http://localhost:3000/api/evaluations')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Erreur lors de la récupération des demandes d\'estimation')
    })
  })

  describe('POST /api/evaluations (public)', () => {
    it('devrait créer une évaluation valide et retourner 201', async () => {
      mockPrismaClient.evaluation.create.mockResolvedValue(mockEvaluation)

      const request = new Request('http://localhost:3000/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCreateEvaluationBody),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.id).toBe('eval-123')
      expect(mockPrismaClient.evaluation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            propertyType: 'APPARTEMENT',
            postalCode: '75001',
            email: 'jean.dupont@example.com',
            situation: 'VENTE',
            status: 'NOUVELLE',
          }),
        })
      )
    })

    it('devrait utiliser RENSEIGNEMENT par défaut si situation absente', async () => {
      mockPrismaClient.evaluation.create.mockResolvedValue(mockEvaluation)

      const body = { ...mockCreateEvaluationBody }
      delete (body as Record<string, unknown>).situation

      const request = new Request('http://localhost:3000/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      await POST(request)

      expect(mockPrismaClient.evaluation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ situation: 'RENSEIGNEMENT' }),
        })
      )
    })

    it('devrait retourner 400 si un champ requis manque', async () => {
      const body = { ...mockCreateEvaluationBody, email: '' }

      const request = new Request('http://localhost:3000/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Le champ email est requis')
    })

    it('devrait retourner 400 si le code postal est invalide', async () => {
      const body = { ...mockCreateEvaluationBody, postalCode: '1234' }

      const request = new Request('http://localhost:3000/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Le code postal doit contenir 5 chiffres')
    })

    it('devrait retourner 400 si l\'email est invalide', async () => {
      const body = { ...mockCreateEvaluationBody, email: 'not-an-email' }

      const request = new Request('http://localhost:3000/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('L\'adresse email n\'est pas valide')
    })

    it('devrait retourner 500 si Prisma rejette', async () => {
      mockPrismaClient.evaluation.create.mockRejectedValue(new Error('DB error'))

      const request = new Request('http://localhost:3000/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockCreateEvaluationBody),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Erreur lors de la création de la demande d\'estimation')
    })
  })
})
