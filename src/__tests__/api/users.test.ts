import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

import { mockPrismaClient, resetPrismaMocks } from '../mocks/prisma'
import { resetAuthMocks } from '../mocks/auth'
import { mockUser } from '../mocks/fixtures'

import { GET, POST } from '@/app/api/users/route'

const VALID_TOKEN = 'test-admin-api-token'

function buildPost(body: unknown, authHeader?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (authHeader) headers.authorization = authHeader
  return new NextRequest('http://localhost:3000/api/users', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

function buildGet(authHeader?: string) {
  const headers: Record<string, string> = {}
  if (authHeader) headers.authorization = authHeader
  return new NextRequest('http://localhost:3000/api/users', { headers })
}

describe('/api/users', () => {
  beforeEach(() => {
    resetPrismaMocks()
    resetAuthMocks()
  })

  describe('POST', () => {
    it('retourne 401 si le header Authorization manque', async () => {
      const response = await POST(buildPost({ email: 'a@b.c', password: 'longenough' }))
      const data = await response.json()
      expect(response.status).toBe(401)
      expect(data.error).toBe('Vous n\'êtes pas autorisé à effectuer cette action.')
    })

    it('retourne 401 si le header n\'est pas Bearer', async () => {
      const response = await POST(
        buildPost({ email: 'a@b.c', password: 'longenough' }, 'Basic xxx')
      )
      expect(response.status).toBe(401)
    })

    it('retourne 401 si le token est invalide', async () => {
      const response = await POST(
        buildPost({ email: 'a@b.c', password: 'longenough' }, 'Bearer wrong-token')
      )
      expect(response.status).toBe(401)
    })

    it('retourne 400 si l\'email manque', async () => {
      const response = await POST(
        buildPost({ password: 'longenough' }, `Bearer ${VALID_TOKEN}`)
      )
      const data = await response.json()
      expect(response.status).toBe(400)
      expect(data.error).toBe('L\'email est requis')
    })

    it('retourne 400 si le password manque', async () => {
      const response = await POST(
        buildPost({ email: 'a@b.c' }, `Bearer ${VALID_TOKEN}`)
      )
      const data = await response.json()
      expect(response.status).toBe(400)
      expect(data.error).toBe('Le mot de passe est requis')
    })

    it('retourne 400 pour un email invalide', async () => {
      const response = await POST(
        buildPost({ email: 'invalid', password: 'longenough' }, `Bearer ${VALID_TOKEN}`)
      )
      const data = await response.json()
      expect(response.status).toBe(400)
      expect(data.error).toBe('Format d\'email invalide')
    })

    it('retourne 400 pour un password trop court', async () => {
      const response = await POST(
        buildPost({ email: 'a@b.c', password: 'short' }, `Bearer ${VALID_TOKEN}`)
      )
      const data = await response.json()
      expect(response.status).toBe(400)
      expect(data.error).toBe('Le mot de passe doit contenir au moins 8 caractères')
    })

    it('retourne 409 si l\'email existe déjà', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser)

      const response = await POST(
        buildPost({ email: 'admin@example.com', password: 'longenough' }, `Bearer ${VALID_TOKEN}`)
      )
      const data = await response.json()
      expect(response.status).toBe(409)
      expect(data.error).toBe('Un utilisateur avec cet email existe déjà')
    })

    it('crée un utilisateur et retourne 201', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null)
      mockPrismaClient.user.create.mockResolvedValue({
        id: 'user-999',
        email: 'new@example.com',
        name: 'New User',
        createdAt: new Date('2024-01-01'),
      })

      const response = await POST(
        buildPost(
          { email: 'NEW@Example.com', password: 'longenough', name: 'New User' },
          `Bearer ${VALID_TOKEN}`
        )
      )
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.user.id).toBe('user-999')
      expect(data.user.email).toBe('new@example.com')
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'new@example.com' },
      })
      expect(mockPrismaClient.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'new@example.com',
            name: 'New User',
          }),
        })
      )
    })

    it('retourne 500 si Prisma rejette', async () => {
      mockPrismaClient.user.findUnique.mockRejectedValue(new Error('DB'))

      const response = await POST(
        buildPost({ email: 'a@b.c', password: 'longenough' }, `Bearer ${VALID_TOKEN}`)
      )
      expect(response.status).toBe(500)
    })
  })

  describe('GET', () => {
    it('retourne 401 sans token valide', async () => {
      const response = await GET(buildGet())
      expect(response.status).toBe(401)
    })

    it('retourne la liste des utilisateurs', async () => {
      mockPrismaClient.user.findMany.mockResolvedValue([
        { ...mockUser, _count: { properties: 3 } },
      ])

      const response = await GET(buildGet(`Bearer ${VALID_TOKEN}`))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.users).toHaveLength(1)
      expect(data.users[0]._count.properties).toBe(3)
    })

    it('retourne 500 si Prisma rejette', async () => {
      mockPrismaClient.user.findMany.mockRejectedValue(new Error('DB'))

      const response = await GET(buildGet(`Bearer ${VALID_TOKEN}`))
      expect(response.status).toBe(500)
    })
  })
})
