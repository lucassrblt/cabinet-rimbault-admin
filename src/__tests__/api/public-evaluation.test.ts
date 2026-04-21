import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

import { mockPrismaClient, resetPrismaMocks } from '../mocks/prisma'
import { setPublicApiAuth, resetPublicApiAuthMocks } from '../mocks/api-public-auth'
import { mockCreateEvaluationBody, mockEvaluation } from '../mocks/fixtures'

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
})
