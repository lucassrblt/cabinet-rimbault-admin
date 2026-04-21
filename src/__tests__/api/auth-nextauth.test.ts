import { describe, it, expect } from 'vitest'

describe('/api/auth/[...nextauth] smoke test', () => {
  it('exporte des handlers GET et POST', async () => {
    const handlers = await import('@/app/api/auth/[...nextauth]/route')
    expect(typeof handlers.GET).toBe('function')
    expect(typeof handlers.POST).toBe('function')
    // Les deux handlers référencent le même handler NextAuth
    expect(handlers.GET).toBe(handlers.POST)
  })
})
