import { z } from "zod";
import { propertyFormSchema } from "./schema";

// Types pour l'API d'adresses gouvernementale
export interface AddressSuggestion {
  label: string;
  housenumber?: string;
  street?: string;
  postcode: string;
  city: string;
  context: string;
  x: number;
  y: number;
}

export interface AddressApiResponse {
  features: Array<{
    properties: {
      label: string;
      housenumber?: string;
      street?: string;
      postcode: string;
      city: string;
      context: string;
      x: number;
      y: number;
    };
  }>;
}

// Type pour les données du formulaire
export type PropertyFormData = z.infer<typeof propertyFormSchema>;

// Type pour les images existantes
export interface PropertyImageData {
  id: string;
  url: string;
  alt?: string | null;
  caption?: string | null;
  order: number;
  isMain: boolean;
  category: string;
  width?: number | null;
  height?: number | null;
  size?: number | null;
  propertyId: string;
  createdAt: string;
}

// Type pour les documents
export interface PropertyDocumentData {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: number | null;
  mimeType?: string | null;
  description?: string | null;
  propertyId: string;
  createdAt: string;
}

// Type pour les données de l'API
export interface PropertyApiData {
  id: string;
  title: string;
  description: string;
  reference: string;
  propertyType: string;
  transactionType: string;
  status: string;
  isPublished: boolean;
  isFeatured: boolean;
  isExclusive: boolean;
  finance?: {
    price: number;
    charges?: number | null;
    chargesIncluses?: boolean;
    honoraires?: number | null;
    honorairesType?: string | null;
    honorairesPct?: number | null;
    taxeFonciere?: number | null;
  } | null;
  location?: {
    address: string;
    city: string;
    postalCode: string;
    neighborhood?: string | null;
  } | null;
  characteristics?: {
    surface: number;
    surfaceTerrain?: number | null;
    rooms: number;
    bedrooms: number;
    bathrooms: number;
    showerRooms?: number | null;
    toilets?: number | null;
    floor?: number | null;
    floorIsRezDeChaussee?: boolean;
    totalFloors?: number | null;
    yearBuilt?: number | null;
    renovatedYear?: number | null;
  } | null;
  amenities?: {
    hasBalcony?: boolean;
    hasTerrace?: boolean;
    hasGarden?: boolean;
    hasParking?: boolean;
    parkingSpaces?: number | null;
    hasGarage?: boolean;
    hasCellar?: boolean;
    hasElevator?: boolean;
    hasPool?: boolean;
  } | null;
  energy?: {
    energyClass?: string | null;
    energyValue?: number | null;
    gesClass?: string | null;
    gesValue?: number | null;
    heatingType?: string | null;
    heatingEnergy?: string | null;
  } | null;
  copro?: {
    isInCopro?: boolean;
    coprLots?: number | null;
    coprCharges?: number | null;
    coprProcedure?: boolean;
  } | null;
  images?: PropertyImageData[] | null;
  documents?: PropertyDocumentData[] | null;
}

/**
 * Extrait les URLs des documents depuis le tableau de documents
 */
export function getDocumentUrls(documents?: PropertyDocumentData[] | null): {
  dpeImageUrl: string | null;
  gesImageUrl: string | null;
  labelPdfUrl: string | null;
  descriptiveSheetPdfUrl: string | null;
} {
  if (!documents || documents.length === 0) {
    return {
      dpeImageUrl: null,
      gesImageUrl: null,
      labelPdfUrl: null,
      descriptiveSheetPdfUrl: null,
    };
  }

  const docMap = new Map(documents.map((d) => [d.type, d.url]));

  return {
    dpeImageUrl: docMap.get("DPE_IMAGE") ?? null,
    gesImageUrl: docMap.get("GES_IMAGE") ?? null,
    labelPdfUrl: docMap.get("LABEL_PDF") ?? null,
    descriptiveSheetPdfUrl: docMap.get("DESCRIPTIVE_SHEET_PDF") ?? null,
  };
}

// Props du composant principal
export interface PropertyFormProps {
  mode: "create" | "edit";
  initialData?: PropertyApiData;
  propertyId?: string;
}

// Types pour les étapes
export type StepId = "general" | "details" | "dpe" | "images";

export interface FormStep {
  id: StepId;
  label: string;
  shortLabel: string;
}
