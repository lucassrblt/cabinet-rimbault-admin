import type { PropertyApiData, PropertyFormData } from "./types"

// Fonction pour transformer les données de l'API vers le formulaire
export function apiDataToFormData(data: PropertyApiData): Partial<PropertyFormData> {
  return {
    title: data.title,
    description: data.description,
    reference: data.reference,
    propertyType: data.propertyType as PropertyFormData["propertyType"],
    transactionType: data.transactionType as PropertyFormData["transactionType"],
    status: data.status as PropertyFormData["status"],
    isPublished: data.isPublished,
    isFeatured: data.isFeatured,
    
    // Finance
    price: data.finance?.price ?? 0,
    charges: data.finance?.charges,
    chargesIncluses: data.finance?.chargesIncluses ?? false,
    honoraires: data.finance?.honoraires,
    honorairesType: data.finance?.honorairesType,
    honorairesPct: data.finance?.honorairesPct,
    
    // Location
    address: data.location?.address ?? "",
    city: data.location?.city ?? "",
    postalCode: data.location?.postalCode ?? "",
    neighborhood: data.location?.neighborhood,
    
    // Caractéristiques
    surface: data.characteristics?.surface ?? 0,
    surfaceTerrain: data.characteristics?.surfaceTerrain,
    rooms: data.characteristics?.rooms ?? 1,
    bedrooms: data.characteristics?.bedrooms ?? 0,
    bathrooms: data.characteristics?.bathrooms ?? 1,
    floor: data.characteristics?.floor,
    totalFloors: data.characteristics?.totalFloors,
    yearBuilt: data.characteristics?.yearBuilt,
    renovatedYear: data.characteristics?.renovatedYear,
    
    // Équipements
    hasBalcony: data.amenities?.hasBalcony ?? false,
    hasTerrace: data.amenities?.hasTerrace ?? false,
    hasGarden: data.amenities?.hasGarden ?? false,
    hasParking: data.amenities?.hasParking ?? false,
    parkingSpaces: data.amenities?.parkingSpaces,
    hasGarage: data.amenities?.hasGarage ?? false,
    hasCellar: data.amenities?.hasCellar ?? false,
    hasElevator: data.amenities?.hasElevator ?? false,
    hasPool: data.amenities?.hasPool ?? false,
    
    // Énergie
    energyClass: data.energy?.energyClass as PropertyFormData["energyClass"],
    energyValue: data.energy?.energyValue ?? 0,
    gesClass: data.energy?.gesClass as PropertyFormData["gesClass"],
    gesValue: data.energy?.gesValue ?? 0,
    heatingType: data.energy?.heatingType as PropertyFormData["heatingType"],
    heatingEnergy: data.energy?.heatingEnergy as PropertyFormData["heatingEnergy"],
    dpeImageUrl: data.energy?.dpeImageUrl,
    gesImageUrl: data.energy?.gesImageUrl,
    
    // Copropriété
    isInCopro: data.copro?.isInCopro ?? false,
    coprLots: data.copro?.coprLots,
    coprCharges: data.copro?.coprCharges,
    coprProcedure: data.copro?.coprProcedure ?? false,
  }
}

// Fonction pour transformer les données du formulaire vers l'API
export function formDataToApiData(data: PropertyFormData) {
  return {
    title: data.title,
    description: data.description,
    reference: data.reference,
    propertyType: data.propertyType,
    transactionType: data.transactionType,
    status: data.status,
    isPublished: data.isPublished,
    isFeatured: data.isFeatured,
    
    finance: {
      price: data.price,
      charges: data.charges || null,
      chargesIncluses: data.chargesIncluses,
      honoraires: data.honoraires || null,
      honorairesType: data.honorairesType || null,
      honorairesPct: data.honorairesPct || null,
    },
    
    location: {
      address: data.address,
      city: data.city,
      postalCode: data.postalCode,
      neighborhood: data.neighborhood || null,
    },
    
    characteristics: {
      surface: data.surface,
      surfaceTerrain: data.surfaceTerrain || null,
      rooms: data.rooms,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      floor: data.floor || null,
      totalFloors: data.totalFloors || null,
      yearBuilt: data.yearBuilt || null,
      renovatedYear: data.renovatedYear || null,
    },
    
    amenities: {
      hasBalcony: data.hasBalcony,
      hasTerrace: data.hasTerrace,
      hasGarden: data.hasGarden,
      hasParking: data.hasParking,
      parkingSpaces: data.parkingSpaces || null,
      hasGarage: data.hasGarage,
      hasCellar: data.hasCellar,
      hasElevator: data.hasElevator,
      hasPool: data.hasPool,
    },
    
    energy: {
      energyClass: data.energyClass,
      energyValue: data.energyValue,
      gesClass: data.gesClass,
      gesValue: data.gesValue,
      heatingType: data.heatingType || null,
      heatingEnergy: data.heatingEnergy || null,
      dpeImageUrl: data.dpeImageUrl || null,
      gesImageUrl: data.gesImageUrl || null,
    },
    
    copro: {
      isInCopro: data.isInCopro,
      coprLots: data.coprLots || null,
      coprCharges: data.coprCharges || null,
      coprProcedure: data.coprProcedure,
    },
  }
}

// Fonction pour arrondir les honoraires à un chiffre "propre"
export function roundToNiceNumber(value: number): number {
  if (value >= 10000) {
    return Math.round(value / 1000) * 1000 // Arrondir au millier le plus proche
  } else if (value >= 1000) {
    return Math.round(value / 100) * 100 // Arrondir à la centaine la plus proche
  } else if (value >= 100) {
    return Math.round(value / 10) * 10 // Arrondir à la dizaine la plus proche
  }
  return Math.round(value)
}

