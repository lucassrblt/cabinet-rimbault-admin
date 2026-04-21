import { describe, it, expect, beforeEach } from 'vitest'

import { mockPrismaClient, resetPrismaMocks } from '../mocks/prisma'
import { setAuthenticated, resetAuthMocks } from '../mocks/auth'
import { mockAgencySettings } from '../mocks/fixtures'

import { GET, PUT } from '@/app/api/agency-settings/route'

describe('/api/agency-settings', () => {
  beforeEach(() => {
    resetPrismaMocks()
    resetAuthMocks()
  })

  describe('GET', () => {
    it('retourne 401 si non authentifié', async () => {
      setAuthenticated(false)
      const response = await GET()
      expect(response.status).toBe(401)
    })

    it('retourne les settings existants', async () => {
      setAuthenticated(true)
      mockPrismaClient.agencySettings.findUnique.mockResolvedValue(mockAgencySettings)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.id).toBe('default')
      expect(data.name).toBe('Cabinet Rimbault')
    })

    it('crée les settings par défaut s\'ils n\'existent pas', async () => {
      setAuthenticated(true)
      mockPrismaClient.agencySettings.findUnique.mockResolvedValue(null)
      mockPrismaClient.agencySettings.create.mockResolvedValue({ id: 'default' })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.id).toBe('default')
      expect(mockPrismaClient.agencySettings.create).toHaveBeenCalledWith({
        data: { id: 'default' },
      })
    })

    it('retourne 500 si Prisma rejette', async () => {
      setAuthenticated(true)
      mockPrismaClient.agencySettings.findUnique.mockRejectedValue(new Error('DB'))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Erreur lors de la récupération des paramètres')
    })
  })

  describe('PUT', () => {
    it('retourne 401 si non authentifié', async () => {
      setAuthenticated(false)
      const request = new Request('http://localhost:3000/api/agency-settings', {
        method: 'PUT',
        body: JSON.stringify({}),
      })
      const response = await PUT(request)
      expect(response.status).toBe(401)
    })

    it('upsert les settings avec ID default', async () => {
      setAuthenticated(true)
      mockPrismaClient.agencySettings.upsert.mockResolvedValue(mockAgencySettings)

      const body = {
        name: 'Cabinet Rimbault',
        address: '1 rue de la Paix',
        city: 'Paris',
        postalCode: '75001',
        phone: '0102030405',
        email: 'contact@cabinet-rimbault.fr',
      }

      const request = new Request('http://localhost:3000/api/agency-settings', {
        method: 'PUT',
        body: JSON.stringify(body),
      })
      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.id).toBe('default')
      expect(mockPrismaClient.agencySettings.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'default' },
          update: body,
          create: { id: 'default', ...body },
        })
      )
    })

    it('utilise des strings vides par défaut pour les champs manquants', async () => {
      setAuthenticated(true)
      mockPrismaClient.agencySettings.upsert.mockResolvedValue(mockAgencySettings)

      const request = new Request('http://localhost:3000/api/agency-settings', {
        method: 'PUT',
        body: JSON.stringify({}),
      })
      await PUT(request)

      expect(mockPrismaClient.agencySettings.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: { name: '', address: '', city: '', postalCode: '', phone: '', email: '' },
        })
      )
    })

    it('retourne 500 si upsert rejette', async () => {
      setAuthenticated(true)
      mockPrismaClient.agencySettings.upsert.mockRejectedValue(new Error('DB'))

      const request = new Request('http://localhost:3000/api/agency-settings', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Foo' }),
      })
      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Erreur lors de la mise à jour des paramètres')
    })
  })
})
