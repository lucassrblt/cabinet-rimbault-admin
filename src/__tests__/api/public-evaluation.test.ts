import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

import { mockPrismaClient, resetPrismaMocks } from '../mocks/prisma'
import { setPublicApiAuth, resetPublicApiAuthMocks } from '../mocks/api-public-auth'
import { mockResendSend, resetResendMocks } from '../mocks/resend'
import { mockCreateEvaluationBody, mockEvaluation, mockAgencySettings } from '../mocks/fixtures'

import { POST } from '@/app/api/public/evaluation/route'

function buildRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/public/evaluation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('/api/public/evaluation', () => {
  beforeEach(() => {
    resetPrismaMocks()
    resetPublicApiAuthMocks()
    resetResendMocks()
    mockPrismaClient.agencySettings.findUnique.mockResolvedValue(mockAgencySettings)
  })

  it('retourne 401 sans API Key', async () => {
    setPublicApiAuth(false)
    const response = await POST(buildRequest(mockCreateEvaluationBody))
    expect(response.status).toBe(401)
  })

  it('crée une évaluation valide et retourne 201 avec id + createdAt', async () => {
    mockPrismaClient.evaluation.create.mockResolvedValue(mockEvaluation)

    const response = await POST(buildRequest(mockCreateEvaluationBody))
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.data.id).toBe('eval-123')
    expect(data.data.createdAt).toBeDefined()
    // Ne retourne pas toute l'évaluation (pas de fuite)
    expect(data.data.email).toBeUndefined()
    expect(data.data.phone).toBeUndefined()
  })

  it('retourne 400 si un champ requis manque', async () => {
    const body = { ...mockCreateEvaluationBody, email: '' }
    const response = await POST(buildRequest(body))
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Le champ email est requis')
  })

  it('retourne 400 sur code postal invalide', async () => {
    const body = { ...mockCreateEvaluationBody, postalCode: '123' }
    const response = await POST(buildRequest(body))
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.error).toBe('Le code postal doit contenir 5 chiffres')
  })

  it('retourne 400 sur email invalide', async () => {
    const body = { ...mockCreateEvaluationBody, email: 'not-an-email' }
    const response = await POST(buildRequest(body))
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.error).toBe('L\'adresse email n\'est pas valide')
  })

  it('retourne 500 si Prisma rejette', async () => {
    mockPrismaClient.evaluation.create.mockRejectedValue(new Error('DB'))
    const response = await POST(buildRequest(mockCreateEvaluationBody))
    const data = await response.json()
    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
  })

  // Phase C — champs additifs optionnels (contrat API §5.3)
  it('accepte un body enrichi et persiste les nouveaux champs optionnels', async () => {
    mockPrismaClient.evaluation.create.mockResolvedValue(mockEvaluation)

    const body = {
      ...mockCreateEvaluationBody,
      condition: 'BON_ETAT',
      timeframe: '3_MOIS',
      intent: 'SELL',
      message: 'Je souhaite une estimation rapide',
      rgpd: true,
      source: 'vitrine',
      userAgent: 'Mozilla/5.0',
      referer: 'https://vitrine.example.com/estimation',
    }

    const response = await POST(buildRequest(body))
    expect(response.status).toBe(201)

    const call = mockPrismaClient.evaluation.create.mock.calls[0][0]
    expect(call.data.condition).toBe('BON_ETAT')
    expect(call.data.timeframe).toBe('3_MOIS')
    expect(call.data.intent).toBe('SELL')
    expect(call.data.message).toBe('Je souhaite une estimation rapide')
    expect(call.data.rgpd).toBe(true)
    expect(call.data.source).toBe('vitrine')
    expect(call.data.userAgent).toBe('Mozilla/5.0')
    expect(call.data.referer).toBe('https://vitrine.example.com/estimation')
  })

  it('rejette 400 si `condition` est hors de l\'enum PropertyCondition', async () => {
    const body = { ...mockCreateEvaluationBody, condition: 'INVALIDE' }
    const response = await POST(buildRequest(body))
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toMatch(/condition/i)
  })

  it('persiste les nouveaux champs à null quand le body minimal ne les contient pas (non-régression)', async () => {
    mockPrismaClient.evaluation.create.mockResolvedValue(mockEvaluation)

    const response = await POST(buildRequest(mockCreateEvaluationBody))
    expect(response.status).toBe(201)

    const call = mockPrismaClient.evaluation.create.mock.calls[0][0]
    expect(call.data.condition).toBeNull()
    expect(call.data.timeframe).toBeNull()
    expect(call.data.intent).toBeNull()
    expect(call.data.message).toBeNull()
    expect(call.data.rgpd).toBeNull()
    expect(call.data.source).toBeNull()
    expect(call.data.userAgent).toBeNull()
    expect(call.data.referer).toBeNull()
  })

  it('devrait envoyer un email de confirmation après création', async () => {
    mockPrismaClient.evaluation.create.mockResolvedValue(mockEvaluation)

    await POST(buildRequest(mockCreateEvaluationBody))

    // Wait for the fire-and-forget promise chain to settle
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(mockPrismaClient.agencySettings.findUnique).toHaveBeenCalledWith({
      where: { id: 'default' },
    })
    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: mockCreateEvaluationBody.email,
        subject: "Votre demande d'estimation a bien été reçue",
        html: expect.stringContaining(mockCreateEvaluationBody.firstName),
      })
    )
  })

  it('devrait retourner 201 même si l\'envoi d\'email échoue', async () => {
    mockPrismaClient.evaluation.create.mockResolvedValue(mockEvaluation)
    mockResendSend.mockRejectedValueOnce(new Error('Resend error'))

    const response = await POST(buildRequest(mockCreateEvaluationBody))

    expect(response.status).toBe(201)

    // Wait for the fire-and-forget promise chain to settle
    await new Promise((resolve) => setTimeout(resolve, 50))
  })
})
