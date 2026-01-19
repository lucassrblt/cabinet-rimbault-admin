import { z } from "zod"
import { propertyFormSchema } from "./schema"

// Types pour l'API d'adresses gouvernementale
export interface AddressSuggestion {
  label: string
  housenumber?: string
  street?: string
  postcode: string
  city: string
  context: string
  x: number
  y: number
}

export interface AddressApiResponse {
  features: Array<{
    properties: {
      label: string
      housenumber?: string
      street?: string
      postcode: string
      city: string
      context: string
      x: number
      y: number
    }
  }>
}

// Type pour les données du formulaire
export type PropertyFormData = z.infer<typeof propertyFormSchema>

// Type pour les images existantes
export interface PropertyImageData {
  id: string
  url: string
  alt?: string | null
  caption?: string | null
  order: number
  isMain: boolean
  category: string
  width?: number | null
  height?: number | null
  size?: number | null
  propertyId: string
  createdAt: string
}

// Type pour les données de l'API
export interface PropertyApiData {
  id: string
  title: string
  description: string
  reference: string
  propertyType: string
  transactionType: string
  status: string
  isPublished: boolean
  isFeatured: boolean
  finance?: {
    price: number
    charges?: number | null
    chargesIncluses?: boolean
    honoraires?: number | null
    honorairesType?: string | null
    honorairesPct?: number | null
  } | null
  location?: {
    address: string
    city: string
    postalCode: string
    neighborhood?: string | null
  } | null
  characteristics?: {
    surface: number
    surfaceTerrain?: number | null
    rooms: number
    bedrooms: number
    bathrooms: number
    floor?: number | null
    totalFloors?: number | null
    yearBuilt?: number | null
    renovatedYear?: number | null
  } | null
  amenities?: {
    hasBalcony?: boolean
    hasTerrace?: boolean
    hasGarden?: boolean
    hasParking?: boolean
    parkingSpaces?: number | null
    hasGarage?: boolean
    hasCellar?: boolean
    hasElevator?: boolean
    hasPool?: boolean
  } | null
  energy?: {
    energyClass?: string | null
    energyValue?: number | null
    gesClass?: string | null
    gesValue?: number | null
    heatingType?: string | null
    heatingEnergy?: string | null
    dpeImageUrl?: string | null
    gesImageUrl?: string | null
  } | null
  copro?: {
    isInCopro?: boolean
    coprLots?: number | null
    coprCharges?: number | null
    coprProcedure?: boolean
  } | null
  images?: PropertyImageData[] | null
}

// Props du composant principal
export interface PropertyFormProps {
  mode: "create" | "edit"
  initialData?: PropertyApiData
  propertyId?: string
}

// Types pour les étapes
export type StepId = "general" | "details" | "dpe" | "images"

export interface FormStep {
  id: StepId
  label: string
  shortLabel: string
}

