import { vi } from 'vitest'

// Mock Prisma client with all models
export const mockPrismaClient = {
  property: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  propertyFinance: {
    create: vi.fn(),
    update: vi.fn(),
  },
  propertyLocation: {
    create: vi.fn(),
    update: vi.fn(),
  },
  propertyCharacteristics: {
    create: vi.fn(),
    update: vi.fn(),
  },
  propertyAmenities: {
    create: vi.fn(),
    update: vi.fn(),
  },
  propertyEnergy: {
    create: vi.fn(),
    update: vi.fn(),
    findUnique: vi.fn(),
  },
  propertyCopro: {
    create: vi.fn(),
    update: vi.fn(),
  },
  propertyImage: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
  },
  propertyDocument: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  propertyRoom: {
    findMany: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  propertyProximity: {
    findMany: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  evaluation: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  lead: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  agencySettings: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
  },
  user: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  $transaction: vi.fn((callback) => callback(mockPrismaClient)),
}

// Mock the prisma module
vi.mock('@/lib/prisma', () => ({
  prisma: mockPrismaClient,
  default: mockPrismaClient,
}))

export function resetPrismaMocks() {
  Object.values(mockPrismaClient).forEach((model) => {
    if (typeof model === 'object' && model !== null) {
      Object.values(model).forEach((fn) => {
        if (typeof fn === 'function' && 'mockReset' in fn) {
          (fn as ReturnType<typeof vi.fn>).mockReset()
        }
      })
    }
  })
  // Reset $transaction to default behavior
  mockPrismaClient.$transaction.mockImplementation((callback) => callback(mockPrismaClient))
}
