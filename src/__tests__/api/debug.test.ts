import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'

import { GET, POST } from '@/app/api/debug/route'

describe('/api/debug', () => {
  it('GET retourne 200 avec les headers masqués', async () => {
    const request = new NextRequest('http://localhost:3000/api/debug', {
      headers: {
        authorization: 'Bearer supersecrettoken12345',
        cookie: 'session=abc123',
        'x-custom': 'visible',
      },
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Debug endpoint')
    expect(data.method).toBe('GET')
    // Authorization header is truncated (first 15 chars + length)
    expect(data.headers.authorization).toContain('Bearer supersec')
    expect(data.headers.authorization).toContain('length:')
    // Cookie masked
    expect(data.headers.cookie).toMatch(/\[MASKED\]/)
    // Non-sensitive header visible
    expect(data.headers['x-custom']).toBe('visible')
    expect(data.env).toHaveProperty('NODE_ENV')
  })

  it('POST retourne 200', async () => {
    const request = new NextRequest('http://localhost:3000/api/debug', { method: 'POST' })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Debug endpoint POST')
    expect(data.method).toBe('POST')
  })
})
