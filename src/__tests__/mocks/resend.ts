import { vi } from 'vitest'

export const mockResendSend = vi.fn().mockResolvedValue({ id: 'mock-email-id' })

vi.mock('@/lib/resend', () => ({
  resend: {
    emails: {
      send: mockResendSend,
    },
  },
}))

export function resetResendMocks() {
  mockResendSend.mockReset()
  mockResendSend.mockResolvedValue({ id: 'mock-email-id' })
}
