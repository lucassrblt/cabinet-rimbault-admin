import type { FormStep, StepId, PropertyFormData } from "./types";

// Définition des étapes du formulaire
export const FORM_STEPS: readonly FormStep[] = [
  { id: "general", label: "Informations générales", shortLabel: "Général" },
  { id: "details", label: "Détails du bien", shortLabel: "Détails" },
  { id: "dpe", label: "DPE & Énergie", shortLabel: "DPE" },
  { id: "images", label: "Images", shortLabel: "Images" },
] as const;

// Champs requis par étape pour la validation
export const STEP_REQUIRED_FIELDS: Record<StepId, (keyof PropertyFormData)[]> =
  {
    general: [
      "reference",
      "title",
      "description",
      "propertyType",
      "transactionType",
      "status",
      "price",
      "address",
      "postalCode",
      "city",
    ],
    details: ["surface", "rooms"],
    dpe: [
      "energyClass",
      "energyValue",
      "finalEnergyValue",
      "gesClass",
      "gesValue",
      "annualEnergyCostMin",
      "annualEnergyCostMax",
      "dateReferenceEnergie",
    ],
    images: [],
  };

// Valeurs par défaut du formulaire
export const DEFAULT_FORM_VALUES: Partial<PropertyFormData> = {
  propertyType: "APPARTEMENT",
  transactionType: "VENTE",
  status: "DISPONIBLE",
  rooms: 1,
  bedrooms: 0,
  bathrooms: 1,
  showerRooms: 0,
  toilets: 0,
  hasBalcony: false,
  hasTerrace: false,
  hasGarden: false,
  hasParking: false,
  hasGarage: false,
  hasCellar: false,
  hasElevator: false,
  hasPool: false,
  isInCopro: false,
  coprProcedure: false,
  isPublished: false,
  isFeatured: false,
  isExclusive: false,
  chargesIncluses: false,
};

// Options pour les selects
export const PROPERTY_TYPE_OPTIONS = [
  { value: "APPARTEMENT", label: "Appartement" },
  { value: "MAISON", label: "Maison" },
  { value: "VILLA", label: "Villa" },
  { value: "TERRAIN", label: "Terrain" },
  { value: "LOCAL_COMMERCIAL", label: "Local commercial" },
  { value: "BUREAUX", label: "Bureaux" },
  { value: "IMMEUBLE", label: "Immeuble" },
  { value: "PARKING", label: "Parking" },
  { value: "CAVE", label: "Cave" },
  { value: "LOFT", label: "Loft" },
  { value: "ATELIER", label: "Atelier" },
  { value: "AUTRE", label: "Autre" },
];

export const TRANSACTION_TYPE_OPTIONS = [
  { value: "VENTE", label: "Vente" },
  { value: "LOCATION", label: "Location" },
  { value: "VIAGER", label: "Viager" },
  { value: "LOCATION_SAISONNIERE", label: "Location saisonnière" },
];

export const STATUS_OPTIONS = [
  { value: "DISPONIBLE", label: "Disponible" },
  { value: "SOUS_COMPROMIS", label: "Sous compromis" },
  { value: "SOUS_OFFRE", label: "Sous offre" },
  { value: "VENDU", label: "Vendu" },
  { value: "LOUE", label: "Loué" },
  { value: "ARCHIVE", label: "Archivé" },
  { value: "BROUILLON", label: "Brouillon" },
];

export const ENERGY_CLASSES = ["A", "B", "C", "D", "E", "F", "G"] as const;

export const HEATING_TYPE_OPTIONS = [
  { value: "INDIVIDUEL", label: "Individuel" },
  { value: "COLLECTIF", label: "Collectif" },
  { value: "MIXTE", label: "Mixte" },
];

export const HEATING_ENERGY_OPTIONS = [
  { value: "GAZ", label: "Gaz" },
  { value: "ELECTRIQUE", label: "Électrique" },
  { value: "FIOUL", label: "Fioul" },
  { value: "BOIS", label: "Bois" },
  { value: "POMPE_A_CHALEUR", label: "Pompe à chaleur" },
  { value: "GEOTHERMIE", label: "Géothermie" },
  { value: "SOLAIRE", label: "Solaire" },
  { value: "CHAUFFAGE_URBAIN", label: "Chauffage urbain" },
  { value: "MIXTE", label: "Mixte" },
];
