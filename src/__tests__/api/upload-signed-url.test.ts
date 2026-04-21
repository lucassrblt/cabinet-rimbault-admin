import { describe, it, expect, beforeEach } from 'vitest'

import { resetPrismaMocks } from '../mocks/prisma'
import { setAuthenticated, resetAuthMocks } from '../mocks/auth'
import {
  mockCreateSignedUploadUrl,
  mockAdminGetPublicUrl,
  setSignedUrlSuccess,
  setSignedUrlFailure,
  resetSupabaseMocks,
} from '../mocks/supabase'

import { POST, PUT } from '@/app/api/upload/signed-url/route'

function buildPost(body: unknown) {
  return new Request('http://localhost:3000/api/upload/signed-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function buildPut(body: unknown) {
  return new Request('http://localhost:3000/api/upload/signed-url', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('/api/upload/signed-url', () => {
  beforeEach(() => {
    resetPrismaMocks()
    resetAuthMocks()
    resetSupabaseMocks()
  })

  describe('POST (single)', () => {
    it('retourne 401 si non authentifié', async () => {
      setAuthenticated(false)
      const response = await POST(buildPost({ filename: 'a.jpg', propertyReference: 'REF-001' }))
      expect(response.status).toBe(401)
    })

    it('retourne 400 si filename ou propertyReference manque', async () => {
      setAuthenticated(true)
      const response = await POST(buildPost({ filename: 'a.jpg' }))
      const data = await response.json()
      expect(response.status).toBe(400)
      expect(data.error).toBe('filename et propertyReference sont requis')
    })

    it('génère une signed URL et la retourne avec la publicUrl', async () => {
      setAuthenticated(true)
      setSignedUrlSuccess('https://signed.example.com/x', 'tok-1', 'https://public.example.com/x')

      const response = await POST(buildPost({ filename: 'photo.jpg', propertyReference: 'REF-001' }))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.signedUrl).toBe('https://signed.example.com/x')
      expect(data.token).toBe('tok-1')
      expect(data.publicUrl).toBe('https://public.example.com/x')
      expect(data.path).toMatch(/^REF-001\/images\/\d+-[a-z0-9]+-photo\.jpg$/)
      expect(mockCreateSignedUploadUrl).toHaveBeenCalledTimes(1)
      expect(mockAdminGetPublicUrl).toHaveBeenCalledTimes(1)
    })

    it('sanitize le filename', async () => {
      setAuthenticated(true)
      setSignedUrlSuccess()

      const response = await POST(
        buildPost({ filename: 'my photo!@#.jpg', propertyReference: 'REF-001' })
      )
      const data = await response.json()

      expect(response.status).toBe(200)
      // Les caractères non autorisés doivent être remplacés par _
      expect(data.path).toMatch(/my_photo___\.jpg$/)
    })

    it('retourne 500 si createSignedUploadUrl échoue', async () => {
      setAuthenticated(true)
      setSignedUrlFailure('Bucket not found')

      const response = await POST(buildPost({ filename: 'a.jpg', propertyReference: 'REF-001' }))
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Bucket not found')
    })
  })

  describe('PUT (batch)', () => {
    it('retourne 401 si non authentifié', async () => {
      setAuthenticated(false)
      const response = await PUT(
        buildPut({ files: [{ filename: 'a.jpg', contentType: 'image/jpeg' }], propertyReference: 'REF-001' })
      )
      expect(response.status).toBe(401)
    })

    it('retourne 400 si files manque ou vide', async () => {
      setAuthenticated(true)

      const response = await PUT(buildPut({ files: [], propertyReference: 'REF-001' }))
      const data = await response.json()
      expect(response.status).toBe(400)
      expect(data.error).toBe('files array requis')
    })

    it('retourne 400 si propertyReference manque', async () => {
      setAuthenticated(true)

      const response = await PUT(
        buildPut({ files: [{ filename: 'a.jpg', contentType: 'image/jpeg' }] })
      )
      const data = await response.json()
      expect(response.status).toBe(400)
      expect(data.error).toBe('propertyReference requis')
    })

    it('retourne 400 si plus de 20 fichiers', async () => {
      setAuthenticated(true)
      const files = Array.from({ length: 21 }, (_, i) => ({
        filename: `f${i}.jpg`,
        contentType: 'image/jpeg',
      }))

      const response = await PUT(buildPut({ files, propertyReference: 'REF-001' }))
      const data = await response.json()
      expect(response.status).toBe(400)
      expect(data.error).toBe('Maximum 20 fichiers par requête')
    })

    it('génère plusieurs signed URLs et remonte les erreurs partielles', async () => {
      setAuthenticated(true)

      // Pour les deux items, la première résout ok, la seconde en erreur
      mockCreateSignedUploadUrl
        .mockResolvedValueOnce({ data: { signedUrl: 'u1', token: 't1' }, error: null })
        .mockResolvedValueOnce({ data: null, error: { message: 'denied' } })
      mockAdminGetPublicUrl.mockReturnValue({ data: { publicUrl: 'p1' } })

      const response = await PUT(
        buildPut({
          files: [
            { filename: 'a.jpg', contentType: 'image/jpeg' },
            { filename: 'b.jpg', contentType: 'image/jpeg' },
          ],
          propertyReference: 'REF-001',
        })
      )
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.signedUrls).toHaveLength(2)
      expect(data.signedUrls[0]).toMatchObject({ filename: 'a.jpg', signedUrl: 'u1', token: 't1' })
      expect(data.signedUrls[1]).toMatchObject({ filename: 'b.jpg', error: 'denied' })
    })
  })
})
