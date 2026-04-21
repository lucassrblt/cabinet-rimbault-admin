import { describe, it, expect, beforeEach } from 'vitest'

import { resetPrismaMocks } from '../mocks/prisma'
import { setAuthenticated, resetAuthMocks } from '../mocks/auth'

import { POST } from '@/app/api/labels/generate-preview/route'

const validBody = {
  reference: 'REF-001',
  energyValue: 180,
  energyClass: 'D',
  gesValue: 35,
  gesClass: 'E',
}

function buildRequest(body: unknown) {
  return new Request('http://localhost:3000/api/labels/generate-preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('/api/labels/generate-preview', () => {
  beforeEach(() => {
    resetPrismaMocks()
    resetAuthMocks()
  })

  it('retourne 401 si non authentifié', async () => {
    setAuthenticated(false)
    const response = await POST(buildRequest(validBody))
    expect(response.status).toBe(401)
  })

  it('génère la preview des étiquettes avec data URLs', async () => {
    setAuthenticated(true)

    const response = await POST(buildRequest(validBody))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.preview).toBeDefined()
    expect(data.preview.dpeImageUrl).toMatch(/^data:image\/svg\+xml;base64,/)
    expect(data.preview.gesImageUrl).toMatch(/^data:image\/svg\+xml;base64,/)
    expect(data.preview.energyClass).toBe('D')
    expect(data.preview.gesClass).toBe('E')
    expect(data.preview.energyValue).toBe(180)
    expect(data.preview.gesValue).toBe(35)
  })

  it('normalise les classes en majuscules', async () => {
    setAuthenticated(true)

    const response = await POST(buildRequest({ ...validBody, energyClass: 'd', gesClass: 'e' }))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.preview.energyClass).toBe('D')
    expect(data.preview.gesClass).toBe('E')
  })

  it('retourne 400 si les données DPE manquent', async () => {
    setAuthenticated(true)

    const response = await POST(buildRequest({ ...validBody, energyClass: '', energyValue: 0 }))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('DPE')
  })

  it('retourne 400 si les données GES manquent', async () => {
    setAuthenticated(true)

    const response = await POST(buildRequest({ ...validBody, gesClass: '', gesValue: 0 }))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('GES')
  })

  it('retourne 400 si la référence manque', async () => {
    setAuthenticated(true)

    const response = await POST(buildRequest({ ...validBody, reference: '' }))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('La référence de la propriété est requise')
  })

  it('retourne 400 pour une classe DPE invalide', async () => {
    setAuthenticated(true)

    const response = await POST(buildRequest({ ...validBody, energyClass: 'Z' }))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Classe DPE invalide')
  })

  it('retourne 400 pour une classe GES invalide', async () => {
    setAuthenticated(true)

    const response = await POST(buildRequest({ ...validBody, gesClass: 'Z' }))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Classe GES invalide')
  })
})
