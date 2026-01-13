import { vi } from 'vitest'

// Mock uploadToStorage function
export const mockUploadToStorage = vi.fn()
export const mockDeleteFromStorage = vi.fn()
export const mockGetPublicUrl = vi.fn()

// Mock the supabase module
vi.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
        remove: vi.fn(),
      })),
    },
  },
  supabaseAdmin: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
        remove: vi.fn(),
      })),
    },
  },
  uploadToStorage: (...args: Parameters<typeof mockUploadToStorage>) => mockUploadToStorage(...args),
  deleteFromStorage: (...args: Parameters<typeof mockDeleteFromStorage>) => mockDeleteFromStorage(...args),
  getPublicUrl: (...args: Parameters<typeof mockGetPublicUrl>) => mockGetPublicUrl(...args),
  BUCKETS: {
    LABELS: 'labels',
    FILES: 'files',
    DPE_IMAGES: 'dpe-images',
    PROPERTY_IMAGES: 'property-images',
  },
  testSupabaseConnection: vi.fn().mockResolvedValue(undefined),
}))

// Helper to set upload success
export function setUploadSuccess(url: string = 'https://test-bucket.supabase.co/test-file.pdf') {
  mockUploadToStorage.mockResolvedValue({ url, error: null })
}

// Helper to set upload failure
export function setUploadFailure(error: Error = new Error('Upload failed')) {
  mockUploadToStorage.mockResolvedValue({ url: null, error })
}

// Reset mocks
export function resetSupabaseMocks() {
  mockUploadToStorage.mockReset()
  mockDeleteFromStorage.mockReset()
  mockGetPublicUrl.mockReset()
}

