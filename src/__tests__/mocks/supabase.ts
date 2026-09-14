import { vi } from 'vitest'

// Mock storage helpers
export const mockUploadToStorage = vi.fn()
export const mockDeleteFromStorage = vi.fn()
export const mockDeleteFolderFromStorage = vi.fn()
export const mockGetPublicUrl = vi.fn()

// Mock supabaseAdmin.storage.from().createSignedUploadUrl() / getPublicUrl()
export const mockCreateSignedUploadUrl = vi.fn()
export const mockAdminGetPublicUrl = vi.fn()

const supabaseAdminStub = {
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(),
      getPublicUrl: (...args: unknown[]) => mockAdminGetPublicUrl(...args),
      remove: vi.fn(),
      createSignedUploadUrl: (...args: unknown[]) => mockCreateSignedUploadUrl(...args),
    })),
  },
}

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
  supabaseAdmin: supabaseAdminStub,
  uploadToStorage: (...args: Parameters<typeof mockUploadToStorage>) => mockUploadToStorage(...args),
  deleteFromStorage: (...args: Parameters<typeof mockDeleteFromStorage>) => mockDeleteFromStorage(...args),
  deleteFolderFromStorage: (...args: Parameters<typeof mockDeleteFolderFromStorage>) => mockDeleteFolderFromStorage(...args),
  getPublicUrl: (...args: Parameters<typeof mockGetPublicUrl>) => mockGetPublicUrl(...args),
  BUCKETS: {
    PROPERTY_FILES: 'property-files',
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

// Helper to set signed URL success
export function setSignedUrlSuccess(
  signedUrl: string = 'https://test-bucket.supabase.co/signed-url',
  token: string = 'test-token',
  publicUrl: string = 'https://test-bucket.supabase.co/public-url'
) {
  mockCreateSignedUploadUrl.mockResolvedValue({ data: { signedUrl, token }, error: null })
  mockAdminGetPublicUrl.mockReturnValue({ data: { publicUrl } })
}

// Helper to set signed URL failure
export function setSignedUrlFailure(message: string = 'Signed URL failed') {
  mockCreateSignedUploadUrl.mockResolvedValue({ data: null, error: { message } })
}

// Reset mocks
export function resetSupabaseMocks() {
  mockUploadToStorage.mockReset()
  mockDeleteFromStorage.mockReset()
  mockDeleteFolderFromStorage.mockReset()
  mockGetPublicUrl.mockReset()
  mockCreateSignedUploadUrl.mockReset()
  mockAdminGetPublicUrl.mockReset()
}
