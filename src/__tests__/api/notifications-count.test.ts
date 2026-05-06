import { describe, it, expect, beforeEach } from 'vitest'

import { mockPrismaClient, resetPrismaMocks } from '../mocks/prisma'
import { setAuthenticated, resetAuthMocks } from '../mocks/auth'

import { GET } from '@/app/api/notifications/count/route'

describe('/api/notifications/count', () => {
  beforeEach(() => {
    resetPrismaMocks()
    resetAuthMocks()
  })

  it('retourne 401 si non authentifié', async () => {
    setAuthenticated(false)
    const response = await GET()
    expect(response.status).toBe(401)
  })

  it('retourne les compteurs corrects', async () => {
    setAuthenticated(true)
    mockPrismaClient.lead.count.mockResolvedValue(3)
    mockPrismaClient.evaluation.count.mockResolvedValue(2)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.leads).toBe(3)
    expect(data.evaluations).toBe(2)
    expect(data.total).toBe(5)

    expect(mockPrismaClient.lead.count).toHaveBeenCalledWith({
      where: { status: 'NOUVEAU' },
    })
    expect(mockPrismaClient.evaluation.count).toHaveBeenCalledWith({
      where: { status: 'NOUVELLE' },
    })
  })

  it('retourne zéro quand il n\'y a pas de demandes', async () => {
    setAuthenticated(true)
    mockPrismaClient.lead.count.mockResolvedValue(0)
    mockPrismaClient.evaluation.count.mockResolvedValue(0)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.leads).toBe(0)
    expect(data.evaluations).toBe(0)
    expect(data.total).toBe(0)
  })

  it('retourne 500 si Prisma rejette', async () => {
    setAuthenticated(true)
    mockPrismaClient.lead.count.mockRejectedValue(new Error('DB'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Erreur lors de la récupération des compteurs')
  })
})
