import { z } from "zod"

// Schéma de validation
export const propertyFormSchema = z.object({
  // Informations de base
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  description: z.string().min(20, "La description doit contenir au moins 20 caractères"),
  reference: z.string().min(2, "La référence est requise"),
  propertyType: z.enum(["APPARTEMENT", "MAISON", "VILLA", "TERRAIN", "LOCAL_COMMERCIAL", "BUREAUX", "IMMEUBLE", "PARKING", "CAVE", "LOFT", "ATELIER", "FERME", "CHATEAU", "PROPRIETE", "AUTRE"], {
    required_error: "Le type de bien est obligatoire",
    invalid_type_error: "Le type de bien est invalide",
  }),
  transactionType: z.enum(["VENTE", "LOCATION", "VIAGER", "LOCATION_SAISONNIERE"], {
    required_error: "Le type de transaction est obligatoire",
    invalid_type_error: "Le type de transaction est invalide",
  }),
  status: z.enum(["DISPONIBLE", "SOUS_COMPROMIS", "SOUS_OFFRE", "VENDU", "LOUE", "ARCHIVE", "BROUILLON"], {
    required_error: "Le statut est obligatoire",
    invalid_type_error: "Le statut est invalide",
  }),
  
  // Finance
  price: z.coerce.number().positive("Le prix doit être positif"),
  charges: z.coerce.number().optional().nullable(),
  chargesIncluses: z.boolean().default(false),
  honoraires: z.coerce.number().optional().nullable(),
  honorairesType: z.string().optional().nullable(),
  honorairesPct: z.coerce.number().min(0, "Le pourcentage d'honoraires doit être positif ou nul").max(100, "Le pourcentage d'honoraires ne peut pas dépasser 100%").optional().nullable(),
  
  // Location
  address: z.string().min(5, "L'adresse est requise"),
  city: z.string().min(2, "La ville est requise"),
  postalCode: z.string().length(5, "Le code postal doit contenir 5 chiffres"),
  neighborhood: z.string().optional().nullable(),
  
  // Caractéristiques
  surface: z.coerce.number().positive("La surface doit être positive"),
  surfaceTerrain: z.coerce.number().optional().nullable(),
  rooms: z.coerce.number().int().positive("Le nombre de pièces doit être positif"),
  bedrooms: z.coerce.number().int().min(0, "Le nombre de chambres doit être positif ou nul"),
  bathrooms: z.coerce.number().int().min(0, "Le nombre de salles de bain doit être positif ou nul"),
  floor: z.coerce.number().int().optional().nullable(),
  totalFloors: z.coerce.number().int().optional().nullable(),
  
  // Équipements
  hasBalcony: z.boolean().default(false),
  hasTerrace: z.boolean().default(false),
  hasGarden: z.boolean().default(false),
  hasParking: z.boolean().default(false),
  parkingSpaces: z.coerce.number().int().optional().nullable(),
  hasGarage: z.boolean().default(false),
  hasCellar: z.boolean().default(false),
  hasElevator: z.boolean().default(false),
  hasPool: z.boolean().default(false),
  
  // Construction
  yearBuilt: z.coerce.number().int().optional().nullable(),
  renovatedYear: z.coerce.number().int().optional().nullable(),
  
  // Énergie
  energyClass: z.enum(["A", "B", "C", "D", "E", "F", "G", "VIERGE"], {
    required_error: "La classe énergétique est obligatoire",
  }),
  energyValue: z.coerce.number().int().positive("La consommation énergétique doit être positive"),
  gesClass: z.enum(["A", "B", "C", "D", "E", "F", "G", "VIERGE"], {
    required_error: "La classe GES est obligatoire",
  }),
  gesValue: z.coerce.number().int().positive("Les émissions GES doivent être positives"),
  heatingType: z.enum(["INDIVIDUEL", "COLLECTIF", "MIXTE"], {
    invalid_type_error: "Le type de chauffage est invalide",
  }).optional().nullable(),
  heatingEnergy: z.enum(["GAZ", "ELECTRIQUE", "FIOUL", "BOIS", "POMPE_A_CHALEUR", "GEOTHERMIE", "SOLAIRE", "CHAUFFAGE_URBAIN", "MIXTE"], {
    invalid_type_error: "L'énergie de chauffage est invalide",
  }).optional().nullable(),
  dpeImageUrl: z.string().url("L'URL de l'image DPE est invalide").optional().nullable(),
  gesImageUrl: z.string().url("L'URL de l'image GES est invalide").optional().nullable(),
  
  // Copropriété
  isInCopro: z.boolean().default(false),
  coprLots: z.coerce.number().int().optional().nullable(),
  coprCharges: z.coerce.number().optional().nullable(),
  coprProcedure: z.boolean().default(false),
  
  // Publication
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
})

