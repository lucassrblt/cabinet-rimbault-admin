import { prisma } from "@/lib/prisma"
import { DocumentType, PropertyDocument } from "@prisma/client"

/**
 * Types de documents uniques par propriété (un seul document de ce type par bien)
 */
export const UNIQUE_DOCUMENT_TYPES: DocumentType[] = [
  "DPE_IMAGE",
  "GES_IMAGE",
  "LABEL_PDF",
  "DESCRIPTIVE_SHEET_PDF",
]

/**
 * Interface pour créer/mettre à jour un document
 */
export interface UpsertDocumentInput {
  propertyId: string
  type: DocumentType
  url: string
  name: string
  size?: number
  mimeType?: string
  description?: string
}

/**
 * Crée ou met à jour un document pour une propriété
 * Pour les types uniques (DPE_IMAGE, GES_IMAGE, etc.), remplace l'existant
 * Pour les autres types, crée un nouveau document
 */
export async function upsertPropertyDocument(input: UpsertDocumentInput): Promise<PropertyDocument> {
  const { propertyId, type, url, name, size, mimeType, description } = input

  // Pour les types uniques, on supprime l'ancien document avant d'en créer un nouveau
  if (UNIQUE_DOCUMENT_TYPES.includes(type)) {
    // Supprimer l'ancien document s'il existe
    await prisma.propertyDocument.deleteMany({
      where: {
        propertyId,
        type,
      },
    })
  }

  // Créer le nouveau document
  return prisma.propertyDocument.create({
    data: {
      propertyId,
      type,
      url,
      name,
      size,
      mimeType,
      description,
    },
  })
}

/**
 * Récupère un document par type pour une propriété
 * Retourne le plus récent si plusieurs existent
 */
export async function getDocumentByType(
  propertyId: string,
  type: DocumentType
): Promise<PropertyDocument | null> {
  return prisma.propertyDocument.findFirst({
    where: {
      propertyId,
      type,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

/**
 * Récupère tous les documents d'un type pour une propriété
 */
export async function getDocumentsByType(
  propertyId: string,
  type: DocumentType
): Promise<PropertyDocument[]> {
  return prisma.propertyDocument.findMany({
    where: {
      propertyId,
      type,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

/**
 * Récupère l'URL d'un document par type
 * Raccourci pratique pour les cas simples
 */
export async function getDocumentUrl(
  propertyId: string,
  type: DocumentType
): Promise<string | null> {
  const doc = await getDocumentByType(propertyId, type)
  return doc?.url ?? null
}

/**
 * Récupère les URLs des documents énergétiques (DPE, GES, Label, Fiche)
 * Pratique pour les composants qui ont besoin de toutes ces URLs
 */
export async function getEnergyDocumentUrls(propertyId: string): Promise<{
  dpeImageUrl: string | null
  gesImageUrl: string | null
  labelPdfUrl: string | null
  descriptiveSheetPdfUrl: string | null
}> {
  const documents = await prisma.propertyDocument.findMany({
    where: {
      propertyId,
      type: {
        in: ["DPE_IMAGE", "GES_IMAGE", "LABEL_PDF", "DESCRIPTIVE_SHEET_PDF"],
      },
    },
  })

  const docMap = new Map(documents.map((d) => [d.type, d.url]))

  return {
    dpeImageUrl: docMap.get("DPE_IMAGE") ?? null,
    gesImageUrl: docMap.get("GES_IMAGE") ?? null,
    labelPdfUrl: docMap.get("LABEL_PDF") ?? null,
    descriptiveSheetPdfUrl: docMap.get("DESCRIPTIVE_SHEET_PDF") ?? null,
  }
}

/**
 * Extrait les URLs des documents d'un tableau de documents
 * Version synchrone pour quand les documents sont déjà chargés
 */
export function extractEnergyDocumentUrls(documents: PropertyDocument[]): {
  dpeImageUrl: string | null
  gesImageUrl: string | null
  labelPdfUrl: string | null
  descriptiveSheetPdfUrl: string | null
} {
  const docMap = new Map(documents.map((d) => [d.type, d.url]))

  return {
    dpeImageUrl: docMap.get("DPE_IMAGE") ?? null,
    gesImageUrl: docMap.get("GES_IMAGE") ?? null,
    labelPdfUrl: docMap.get("LABEL_PDF") ?? null,
    descriptiveSheetPdfUrl: docMap.get("DESCRIPTIVE_SHEET_PDF") ?? null,
  }
}

/**
 * Supprime un document
 */
export async function deleteDocument(documentId: string): Promise<void> {
  await prisma.propertyDocument.delete({
    where: { id: documentId },
  })
}

/**
 * Supprime tous les documents d'un type pour une propriété
 */
export async function deleteDocumentsByType(
  propertyId: string,
  type: DocumentType
): Promise<number> {
  const result = await prisma.propertyDocument.deleteMany({
    where: {
      propertyId,
      type,
    },
  })
  return result.count
}
