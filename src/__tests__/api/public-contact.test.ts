import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

import { mockPrismaClient, resetPrismaMocks } from '../mocks/prisma'
import { setPublicApiAuth, resetPublicApiAuthMocks } from '../mocks/api-public-auth'
import { mockLead, mockCreateContactBody } from '../mocks/fixtures'

import { POST } from '@/app/api/public/contact/route'

function buildRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/public/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('/api/public/contact', () => {
  beforeEach(() => {
    resetPrismaMocks()
    resetPublicApiAuthMocks()
  })

  it('retourne 401 sans API Key', async () => {
    setPublicApiAuth(false)
    const response = await POST(buildRequest(mockCreateContactBody))
    expect(response.status).toBe(401)
  })

  it('crée un lead valide et retourne 201 avec id + createdAt', async () => {
    mockPrismaClient.lead.create.mockResolvedValue(mockLead)

    const response = await POST(buildRequest(mockCreateContactBody))
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.data.id).toBe('lead-123')
    expect(data.data.createdAt).toBeDefined()
    // Ne retourne pas toute la donnée (pas de fuite)
    expect(data.data.email).toBeUndefined()
    expect(data.data.phone).toBeUndefined()
  })

  it('persiste le body aplati dans Prisma (contact.* → colonnes top-level, consent.rgpd → rgpd, meta.* → source/page/userAgent/referer)', async () => {
    mockPrismaClient.lead.create.mockResolvedValue(mockLead)

    await POST(buildRequest(mockCreateContactBody))

    const call = mockPrismaClient.lead.create.mock.calls[0][0]
    expect(call.data.subject).toBe('BIEN_SALE')
    expect(call.data.propertyReference).toBe('REF-001')
    expect(call.data.profile).toBe('BUYER')
    expect(call.data.financing).toBe('APPROVED')
    expect(call.data.visitAvailability).toEqual(['MORNING', 'SATURDAY'])
    expect(call.data.firstName).toBe('Alice')
    expect(call.data.lastName).toBe('Martin')
    expect(call.data.email).toBe('alice.martin@example.com')
    expect(call.data.phone).toBe('0601020305')
    expect(call.data.message).toBe('Bonjour, je souhaiterais visiter ce bien.')
    expect(call.data.rgpd).toBe(true)
    expect(call.data.source).toBe('vitrine')
    expect(call.data.page).toBe('/bien/REF-001')
    expect(call.data.userAgent).toBe('Mozilla/5.0')
    expect(call.data.referer).toBe('https://vitrine.example.com/acheter')
  })

  it('accepte un body minimal (subject + contact requis + rgpd=true)', async () => {
    mockPrismaClient.lead.create.mockResolvedValue(mockLead)

    const body = {
      subject: 'OTHER',
      contact: {
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob@example.com',
        message: 'Hello',
      },
      consent: { rgpd: true },
    }

    const response = await POST(buildRequest(body))
    expect(response.status).toBe(201)

    const call = mockPrismaClient.lead.create.mock.calls[0][0]
    expect(call.data.propertyReference).toBeNull()
    expect(call.data.profile).toBeNull()
    expect(call.data.financing).toBeNull()
    expect(call.data.visitAvailability).toEqual([])
    expect(call.data.phone).toBeNull()
    expect(call.data.source).toBeNull()
    expect(call.data.page).toBeNull()
    expect(call.data.userAgent).toBeNull()
    expect(call.data.referer).toBeNull()
  })

  it('retourne 400 si subject est manquant', async () => {
    const body = { ...mockCreateContactBody, subject: undefined }
    const response = await POST(buildRequest(body))
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.fields?.subject).toBeDefined()
  })

  it('retourne 400 si subject est hors enum', async () => {
    const body = { ...mockCreateContactBody, subject: 'INVALIDE' }
    const response = await POST(buildRequest(body))
    expect(response.status).toBe(400)
  })

  it('retourne 400 si contact.email est invalide', async () => {
    const body = {
      ...mockCreateContactBody,
      contact: { ...mockCreateContactBody.contact, email: 'not-an-email' },
    }
    const response = await POST(buildRequest(body))
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.fields?.['contact.email']).toBeDefined()
  })

  it('retourne 400 si contact.message est vide', async () => {
    const body = {
      ...mockCreateContactBody,
      contact: { ...mockCreateContactBody.contact, message: '' },
    }
    const response = await POST(buildRequest(body))
    expect(response.status).toBe(400)
  })

  it('retourne 400 si contact.message dépasse 500 caractères', async () => {
    const body = {
      ...mockCreateContactBody,
      contact: { ...mockCreateContactBody.contact, message: 'a'.repeat(501) },
    }
    const response = await POST(buildRequest(body))
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.fields?.['contact.message']).toBeDefined()
  })

  it('retourne 422 si consent.rgpd n\'est pas true', async () => {
    const body = {
      ...mockCreateContactBody,
      consent: { rgpd: false },
    }
    const response = await POST(buildRequest(body))
    const data = await response.json()
    expect(response.status).toBe(422)
    expect(data.success).toBe(false)
    expect(data.code).toBe('RGPD_REQUIRED')
  })

  it('retourne 500 si Prisma rejette', async () => {
    mockPrismaClient.lead.create.mockRejectedValue(new Error('DB'))
    const response = await POST(buildRequest(mockCreateContactBody))
    const data = await response.json()
    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
  })
})
