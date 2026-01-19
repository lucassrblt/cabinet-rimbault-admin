"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, ArrowRight, Save, Loader2, ImagePlus, X, Star, Trash2, RefreshCw, MapPin } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { autoGenerateEnergyLabels } from "@/lib/energy-labels"

// Types pour l'API d'adresses gouvernementale
interface AddressSuggestion {
  label: string
  housenumber?: string
  street?: string
  postcode: string
  city: string
  context: string
  x: number
  y: number
}

interface AddressApiResponse {
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

// Hook personnalisé pour le debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Définition des étapes du formulaire
const FORM_STEPS = [
  { id: "general", label: "Informations générales", shortLabel: "Général" },
  { id: "details", label: "Détails du bien", shortLabel: "Détails" },
  { id: "dpe", label: "DPE & Énergie", shortLabel: "DPE" },
  { id: "images", label: "Images", shortLabel: "Images" },
] as const

type StepId = typeof FORM_STEPS[number]["id"]

// Champs requis par étape pour la validation
const STEP_REQUIRED_FIELDS: Record<StepId, (keyof PropertyFormData)[]> = {
  general: ["reference", "title", "description", "propertyType", "transactionType", "status", "price", "address", "postalCode", "city"],
  details: ["surface", "rooms"],
  dpe: [],
  images: [],
}

// Schéma de validation
const propertyFormSchema = z.object({
  // Informations de base
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  description: z.string().min(20, "La description doit contenir au moins 20 caractères"),
  reference: z.string().min(2, "La référence est requise"),
  propertyType: z.enum(["APPARTEMENT", "MAISON", "VILLA", "TERRAIN", "LOCAL_COMMERCIAL", "BUREAUX", "IMMEUBLE", "PARKING", "CAVE", "LOFT", "ATELIER", "FERME", "CHATEAU", "PROPRIETE", "AUTRE"]),
  transactionType: z.enum(["VENTE", "LOCATION", "VIAGER", "LOCATION_SAISONNIERE"]),
  status: z.enum(["DISPONIBLE", "SOUS_COMPROMIS", "SOUS_OFFRE", "VENDU", "LOUE", "ARCHIVE", "BROUILLON"]),
  
  // Finance
  price: z.coerce.number().positive("Le prix doit être positif"),
  charges: z.coerce.number().optional().nullable(),
  chargesIncluses: z.boolean().default(false),
  honoraires: z.coerce.number().optional().nullable(),
  honorairesType: z.string().optional().nullable(),
  honorairesPct: z.coerce.number().min(0).max(100).optional().nullable(),
  
  // Location
  address: z.string().min(5, "L'adresse est requise"),
  city: z.string().min(2, "La ville est requise"),
  postalCode: z.string().length(5, "Le code postal doit contenir 5 chiffres"),
  neighborhood: z.string().optional().nullable(),
  
  // Caractéristiques
  surface: z.coerce.number().positive("La surface doit être positive"),
  surfaceTerrain: z.coerce.number().optional().nullable(),
  rooms: z.coerce.number().int().positive("Le nombre de pièces doit être positif"),
  bedrooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().int().min(0),
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
  energyClass: z.enum(["A", "B", "C", "D", "E", "F", "G", "VIERGE"]).optional().nullable(),
  energyValue: z.coerce.number().int().optional().nullable(),
  gesClass: z.enum(["A", "B", "C", "D", "E", "F", "G", "VIERGE"]).optional().nullable(),
  gesValue: z.coerce.number().int().optional().nullable(),
  heatingType: z.enum(["INDIVIDUEL", "COLLECTIF", "MIXTE"]).optional().nullable(),
  heatingEnergy: z.enum(["GAZ", "ELECTRIQUE", "FIOUL", "BOIS", "POMPE_A_CHALEUR", "GEOTHERMIE", "SOLAIRE", "CHAUFFAGE_URBAIN", "MIXTE"]).optional().nullable(),
  
  // Copropriété
  isInCopro: z.boolean().default(false),
  coprLots: z.coerce.number().int().optional().nullable(),
  coprCharges: z.coerce.number().optional().nullable(),
  coprProcedure: z.boolean().default(false),
  
  // Publication
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
})

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
  } | null
  copro?: {
    isInCopro?: boolean
    coprLots?: number | null
    coprCharges?: number | null
    coprProcedure?: boolean
  } | null
  images?: PropertyImageData[] | null
}

interface PropertyFormProps {
  mode: "create" | "edit"
  initialData?: PropertyApiData
  propertyId?: string
}

const CheckboxField = ({ 
  label, 
  checked, 
  onChange: onCheckedChange 
}: { 
  label: string
  checked: boolean
  onChange: (checked: boolean) => void 
}) => (
  <label className="flex items-center gap-2.5 cursor-pointer group">
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={(e) => onCheckedChange(e.target.checked)} 
      className="sr-only" 
    />
    <div className={`h-4 w-4 rounded border transition-colors flex items-center justify-center ${checked ? 'bg-primary border-primary' : 'border-input hover:border-muted-foreground'}`}>
      {checked && (
        <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
    <span className="text-sm text-foreground group-hover:text-foreground/80">{label}</span>
  </label>
)

// Fonction pour transformer les données de l'API vers le formulaire
function apiDataToFormData(data: PropertyApiData): Partial<PropertyFormData> {
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
    energyValue: data.energy?.energyValue,
    gesClass: data.energy?.gesClass as PropertyFormData["gesClass"],
    gesValue: data.energy?.gesValue,
    heatingType: data.energy?.heatingType as PropertyFormData["heatingType"],
    heatingEnergy: data.energy?.heatingEnergy as PropertyFormData["heatingEnergy"],
    
    // Copropriété
    isInCopro: data.copro?.isInCopro ?? false,
    coprLots: data.copro?.coprLots,
    coprCharges: data.copro?.coprCharges,
    coprProcedure: data.copro?.coprProcedure ?? false,
  }
}

// Fonction pour transformer les données du formulaire vers l'API
function formDataToApiData(data: PropertyFormData) {
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
      energyClass: data.energyClass || null,
      energyValue: data.energyValue || null,
      gesClass: data.gesClass || null,
      gesValue: data.gesValue || null,
      heatingType: data.heatingType || null,
      heatingEnergy: data.heatingEnergy || null,
    },
    
    copro: {
      isInCopro: data.isInCopro,
      coprLots: data.coprLots || null,
      coprCharges: data.coprCharges || null,
      coprProcedure: data.coprProcedure,
    },
  }
}

export function PropertyForm({ mode, initialData, propertyId }: PropertyFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [newImages, setNewImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<PropertyImageData[]>(
    initialData?.images || []
  )
  
  // État pour la navigation par étapes
  const [currentStep, setCurrentStep] = useState<number>(0)
  
  // État pour l'autocomplétion d'adresse
  const [addressQuery, setAddressQuery] = useState("")
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([])
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false)
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false)
  const addressInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  
  // Debounce de la recherche d'adresse
  const debouncedAddressQuery = useDebounce(addressQuery, 300)

  const defaultValues: Partial<PropertyFormData> = {
    propertyType: "APPARTEMENT",
    transactionType: "VENTE",
    status: "DISPONIBLE",
    rooms: 1,
    bedrooms: 0,
    bathrooms: 1,
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
    chargesIncluses: false,
  }

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: initialData ? apiDataToFormData(initialData) : defaultValues,
  })

  // Mettre à jour le formulaire quand les données initiales changent
  useEffect(() => {
    if (initialData) {
      const formData = apiDataToFormData(initialData)
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined) {
          form.setValue(key as keyof PropertyFormData, value as never)
        }
      })
      // Mettre à jour les images existantes
      if (initialData.images) {
        setExistingImages(initialData.images)
      }
      // Initialiser le champ d'adresse pour l'autocomplétion
      if (initialData.location?.address) {
        setAddressQuery(initialData.location.address)
      }
    }
  }, [initialData, form])

  // Synchroniser addressQuery avec la valeur du formulaire
  const watchedAddress = form.watch("address")
  useEffect(() => {
    if (watchedAddress && watchedAddress !== addressQuery) {
      setAddressQuery(watchedAddress)
    }
  }, [watchedAddress]) // eslint-disable-line react-hooks/exhaustive-deps

  // Recherche d'adresses avec l'API gouvernementale
  useEffect(() => {
    const fetchAddresses = async () => {
      // Ne pas lancer la recherche si moins de 3 caractères
      if (debouncedAddressQuery.length < 3) {
        setAddressSuggestions([])
        return
      }

      setIsLoadingAddresses(true)
      try {
        const response = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(debouncedAddressQuery)}&limit=5`
        )
        const data: AddressApiResponse = await response.json()
        
        const suggestions: AddressSuggestion[] = data.features.map((feature) => ({
          label: feature.properties.label,
          housenumber: feature.properties.housenumber,
          street: feature.properties.street,
          postcode: feature.properties.postcode,
          city: feature.properties.city,
          context: feature.properties.context,
          x: feature.properties.x,
          y: feature.properties.y,
        }))
        
        setAddressSuggestions(suggestions)
      } catch (error) {
        console.error("Erreur lors de la recherche d'adresses:", error)
        setAddressSuggestions([])
      } finally {
        setIsLoadingAddresses(false)
      }
    }

    fetchAddresses()
  }, [debouncedAddressQuery])

  // Fermer les suggestions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        addressInputRef.current &&
        !addressInputRef.current.contains(event.target as Node)
      ) {
        setShowAddressSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Sélection d'une adresse suggérée
  const handleAddressSelect = (suggestion: AddressSuggestion) => {
    // Construire l'adresse (numéro + rue ou label complet si pas de rue)
    const address = suggestion.street 
      ? `${suggestion.housenumber || ""} ${suggestion.street}`.trim()
      : suggestion.label.split(",")[0].trim()
    
    // Mettre à jour l'état local en premier
    setAddressQuery(address)
    setShowAddressSuggestions(false)
    setAddressSuggestions([])
    
    // Mettre à jour les valeurs du formulaire avec les options pour forcer le re-render
    form.setValue("address", address, { shouldValidate: true, shouldDirty: true })
    form.setValue("postalCode", suggestion.postcode, { shouldValidate: true, shouldDirty: true })
    form.setValue("city", suggestion.city, { shouldValidate: true, shouldDirty: true })
  }

  // Validation d'une étape spécifique
  const validateStep = async (stepIndex: number): Promise<boolean> => {
    const stepId = FORM_STEPS[stepIndex].id
    const requiredFields = STEP_REQUIRED_FIELDS[stepId]
    
    if (requiredFields.length === 0) {
      return true
    }

    const result = await form.trigger(requiredFields)
    return result
  }

  // Validation de toutes les étapes jusqu'à une étape cible
  const validateStepsUpTo = async (targetStep: number): Promise<boolean> => {
    for (let i = currentStep; i < targetStep; i++) {
      const isValid = await validateStep(i)
      if (!isValid) {
        setCurrentStep(i) // Rester sur l'étape invalide
        return false
      }
    }
    return true
  }

  // Navigation vers une étape spécifique (depuis les indicateurs)
  const handleStepClick = async (targetStep: number) => {
    // Si on va vers une étape précédente, pas besoin de validation
    if (targetStep < currentStep) {
      setCurrentStep(targetStep)
      return
    }
    
    // Si on va vers une étape suivante, valider toutes les étapes intermédiaires
    if (targetStep > currentStep) {
      const isValid = await validateStepsUpTo(targetStep)
      
      if (!isValid) {
        toast({
          title: "Champs manquants",
          description: "Veuillez remplir tous les champs obligatoires avant de continuer.",
          variant: "destructive",
        })
        return
      }
      
      setCurrentStep(targetStep)
    }
  }

  const handleNextStep = async () => {
    const isValid = await validateStep(currentStep)
    
    if (!isValid) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires avant de continuer.",
        variant: "destructive",
      })
      return
    }
    
    if (currentStep < FORM_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isLastStep = currentStep === FORM_STEPS.length - 1

  // Fonction pour arrondir les honoraires à un chiffre "propre"
  const roundToNiceNumber = (value: number): number => {
    if (value >= 10000) {
      return Math.round(value / 1000) * 1000 // Arrondir au millier le plus proche
    } else if (value >= 1000) {
      return Math.round(value / 100) * 100 // Arrondir à la centaine la plus proche
    } else if (value >= 100) {
      return Math.round(value / 10) * 10 // Arrondir à la dizaine la plus proche
    }
    return Math.round(value)
  }

  // Calculer les honoraires automatiquement quand le prix ou le pourcentage change
  const price = form.watch("price")
  const honorairesPct = form.watch("honorairesPct")
  const honorairesType = form.watch("honorairesType")

  useEffect(() => {
    if (honorairesType === "acquereur" && price && honorairesPct) {
      const calculatedHonoraires = (Number(price) * Number(honorairesPct)) / (100 + Number(honorairesPct))
      const roundedHonoraires = roundToNiceNumber(calculatedHonoraires)
      form.setValue("honoraires", roundedHonoraires)
    }
  }, [price, honorairesPct, honorairesType, form])

  async function onSubmit(data: PropertyFormData) {
    // Vérifier si on est sur l'étape images et qu'il n'y a aucune image
    if (currentStep === FORM_STEPS.length - 1 && existingImages.length === 0 && newImages.length === 0) {
      const confirmed = window.confirm(
        "Aucune image n'a été sélectionnée. Voulez-vous vraiment enregistrer l'annonce sans images ?"
      )
      if (!confirmed) {
        return
      }
    }

    // Validation des données DPE/GES : OBLIGATOIRE en mode création
    const hasCompleteEnergyData = 
      data.energyClass && 
      data.energyValue && 
      data.gesClass && 
      data.gesValue &&
      data.energyClass !== "VIERGE" &&
      data.gesClass !== "VIERGE"

    // En mode création, les données DPE/GES sont obligatoires
    if (mode === "create" && !hasCompleteEnergyData) {
      toast({
        title: "Données énergétiques obligatoires",
        description: "La génération du DPE et du GES est obligatoire lors de la création d'une annonce. Veuillez renseigner : Classe énergie, Consommation énergétique, Classe GES et Émissions GES (et ne pas être 'Vierge').",
        variant: "destructive",
      })
      // Rediriger vers l'étape DPE
      setCurrentStep(2)
      return
    }

    // En mode édition, si des données sont fournies, elles doivent être complètes
    if (mode === "edit") {
      const hasAnyEnergyData = data.energyClass || data.energyValue || data.gesClass || data.gesValue
      if (hasAnyEnergyData && !hasCompleteEnergyData) {
        toast({
          title: "Données énergétiques incomplètes",
          description: "Pour générer les labels DPE et GES, vous devez renseigner : Classe énergie, Consommation énergétique, Classe GES et Émissions GES (et ne pas être 'Vierge').",
          variant: "destructive",
        })
        // Rediriger vers l'étape DPE
        setCurrentStep(2)
        return
      }
    }

    setIsLoading(true)
    try {
      const apiData = formDataToApiData(data)
      
      const url = mode === "edit" ? `/api/properties/${propertyId}` : "/api/properties"
      const method = mode === "edit" ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Une erreur est survenue")
      }

      // Génération OBLIGATOIRE des labels DPE et GES en mode création
      const targetPropertyId = mode === "edit" ? propertyId : result.id
      const shouldGenerateLabels = 
        data.energyClass && 
        data.energyValue && 
        data.gesClass && 
        data.gesValue &&
        data.energyClass !== "VIERGE" &&
        data.gesClass !== "VIERGE"

      if (shouldGenerateLabels && targetPropertyId) {
        console.log("Génération automatique des labels DPE et GES...")
        try {
          const labelResult = await autoGenerateEnergyLabels({
            propertyId: targetPropertyId,
            reference: data.reference,
            energyValue: data.energyValue!,
            energyClass: data.energyClass!,
            gesValue: data.gesValue!,
            gesClass: data.gesClass!,
          })

          if (labelResult.success) {
            console.log("Labels DPE et GES générés avec succès")
            toast({
              title: "Labels générés",
              description: "Les étiquettes DPE et GES ont été générées automatiquement.",
            })
          } else {
            console.warn("Échec de la génération des labels:", labelResult.error)
            // En mode création, bloquer si la génération échoue
            if (mode === "create") {
              // Supprimer la propriété créée si la génération échoue
              try {
                const deleteResponse = await fetch(`/api/properties/${targetPropertyId}`, { method: "DELETE" })
                if (!deleteResponse.ok) {
                  console.error("Erreur lors de la suppression de la propriété après échec de génération")
                }
              } catch (deleteError) {
                console.error("Erreur lors de la suppression de la propriété:", deleteError)
              }
              
              toast({
                title: "Erreur critique",
                description: `Impossible de générer les labels DPE/GES: ${labelResult.error}. La création de l'annonce a été annulée. Veuillez vérifier vos données et réessayer.`,
                variant: "destructive",
              })
              setIsLoading(false)
              return
            } else {
              // En mode édition, juste avertir
              toast({
                title: "Avertissement",
                description: `Impossible de générer les labels DPE/GES: ${labelResult.error}`,
                variant: "destructive",
              })
            }
          }
        } catch (labelError) {
          console.error("Erreur lors de la génération des labels:", labelError)
          // En mode création, bloquer si la génération échoue
          if (mode === "create") {
            // Supprimer la propriété créée si la génération échoue
            try {
              const deleteResponse = await fetch(`/api/properties/${targetPropertyId}`, { method: "DELETE" })
              if (!deleteResponse.ok) {
                console.error("Erreur lors de la suppression de la propriété après échec de génération")
              }
            } catch (deleteError) {
              console.error("Erreur lors de la suppression de la propriété:", deleteError)
            }
            
            toast({
              title: "Erreur critique",
              description: "Les labels DPE/GES n'ont pas pu être générés. La création de l'annonce a été annulée. Veuillez vérifier vos données et réessayer.",
              variant: "destructive",
            })
            setIsLoading(false)
            return
          } else {
            // En mode édition, juste avertir
            toast({
              title: "Avertissement",
              description: "Les labels DPE/GES n'ont pas pu être générés. Vous pourrez les générer manuellement plus tard.",
              variant: "destructive",
            })
          }
        }
      } else if (mode === "create") {
        // En mode création, cela ne devrait jamais arriver car on a déjà validé
        toast({
          title: "Erreur",
          description: "Les données DPE/GES sont obligatoires mais manquantes.",
          variant: "destructive",
        })
        return
      }

      // Upload des nouvelles images si présentes
      if (newImages.length > 0 && targetPropertyId) {
        setIsUploadingImages(true)
        try {
          const uploadResult = await uploadImages(targetPropertyId, newImages)
          
          // Si des images ont été uploadées avec succès, mettre à jour la liste
          if (uploadResult.images && uploadResult.images.length > 0) {
            setExistingImages((prev) => [...prev, ...uploadResult.images])
            setNewImages([])
          }

          // Afficher un message de succès ou d'avertissement
          if (uploadResult.warning) {
            toast({
              title: "Upload partiel",
              description: uploadResult.warning,
              variant: "destructive",
            })
          } else if (uploadResult.uploaded > 0) {
            toast({
              title: "Images uploadées",
              description: `${uploadResult.uploaded} image(s) uploadée(s) avec succès.`,
            })
          }
        } catch (uploadError) {
          console.error("Error uploading images:", uploadError)
          const errorMessage = uploadError instanceof Error 
            ? uploadError.message 
            : "Erreur lors de l'upload des images"
          
          toast({
            title: mode === "edit" ? "Échec de l'upload" : "Échec de l'upload",
            description: errorMessage,
            variant: "destructive",
          })
          
          // Ne pas rediriger si l'upload a échoué complètement
          // L'utilisateur peut réessayer
          return
        } finally {
          setIsUploadingImages(false)
        }
      }

      toast({
        title: mode === "edit" ? "Modifications enregistrées" : "Annonce créée",
        description: mode === "edit" 
          ? `Les modifications de "${data.title}" ont été enregistrées avec succès.`
          : `L'annonce "${data.reference}" a été créée avec succès.`,
      })
      
      router.push("/properties")
      router.refresh()
    } catch (error) {
      console.error("Error submitting property:", error)
      toast({
        title: mode === "edit" ? "Échec de la modification" : "Échec de la création",
        description: error instanceof Error 
          ? error.message 
          : "Impossible d'enregistrer l'annonce. Vérifiez les données saisies et réessayez.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction pour uploader les images directement vers Supabase
  async function uploadImages(targetPropertyId: string, files: File[]) {
    // Validation : limiter à 20 fichiers par upload (plus de limite de taille grâce à l'upload direct)
    if (files.length > 20) {
      throw new Error(`Trop d'images à la fois. Maximum 20 images par upload (vous tentez d'en uploader ${files.length}).`)
    }

    // Récupérer la référence de la propriété pour construire le chemin d'upload
    let propertyReference: string
    
    if (mode === "edit" && initialData) {
      // En mode édition, utiliser la référence existante
      propertyReference = initialData.reference
    } else {
      // En mode création, utiliser la référence du formulaire
      propertyReference = form.getValues("reference")
      if (!propertyReference) {
        throw new Error("La référence de la propriété est requise pour uploader des images")
      }
    }

    // Import dynamique du service d'upload
    const { uploadMultipleImages } = await import("@/lib/image-upload")

    // Upload direct vers Supabase avec compression automatique
    const { uploaded, failed } = await uploadMultipleImages(
      files,
      propertyReference,
      (uploadedCount, total) => {
        console.log(`📤 Upload: ${uploadedCount}/${total} images uploadées`)
      }
    )

    // Si toutes les images ont échoué
    if (uploaded.length === 0 && failed.length > 0) {
      const errorDetails = failed
        .map((e) => `- ${e.filename}: ${e.error}`)
        .join("\n")
      throw new Error(`Aucune image n'a pu être uploadée.\n\nDétails:\n${errorDetails}`)
    }

    // Si certaines images ont échoué, afficher un warning
    if (failed.length > 0) {
      const errorDetails = failed
        .map((e) => `- ${e.filename}: ${e.error}`)
        .join("\n")
      console.warn(`⚠️ ${failed.length} image(s) n'ont pas pu être uploadées:\n${errorDetails}`)
    }

    // Créer les entrées en base de données via l'API
    const response = await fetch(`/api/properties/${targetPropertyId}/images`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        images: uploaded.map((img) => ({
          url: img.url,
          filename: img.filename,
          size: img.size,
          alt: img.filename.replace(/\.[^/.]+$/, ""),
        })),
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Erreur lors de la création des entrées d'images")
    }

    // Si certaines images ont échoué, le signaler
    if (failed.length > 0) {
      result.warning = `${failed.length} image(s) n'ont pas pu être uploadées`
      result.failed = failed.length
    }

    return result
  }

  // Fonction pour supprimer une image existante
  const deleteExistingImage = useCallback(async (imageId: string) => {
    if (!propertyId) return

    try {
      const response = await fetch(
        `/api/properties/${propertyId}/images?imageId=${imageId}`,
        { method: "DELETE" }
      )

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression")
      }

      setExistingImages((prev) => prev.filter((img) => img.id !== imageId))
      toast({
        title: "Image supprimée",
        description: "L'image a été supprimée avec succès.",
      })
    } catch (error) {
      console.error("Error deleting image:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'image.",
        variant: "destructive",
      })
    }
  }, [propertyId, toast])

  // Fonction pour définir une image comme principale
  const setMainImage = useCallback(async (imageId: string) => {
    if (!propertyId) return

    try {
      const response = await fetch(`/api/properties/${propertyId}/images`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId, isMain: true }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour")
      }

      setExistingImages((prev) =>
        prev.map((img) => ({
          ...img,
          isMain: img.id === imageId,
        }))
      )
      toast({
        title: "Image principale définie",
        description: "L'image a été définie comme image principale.",
      })
    } catch (error) {
      console.error("Error setting main image:", error)
      toast({
        title: "Erreur",
        description: "Impossible de définir l'image principale.",
        variant: "destructive",
      })
    }
  }, [propertyId, toast])

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"))
    const totalImages = existingImages.length + newImages.length + files.length
    if (totalImages > 20) {
      toast({
        title: "Limite atteinte",
        description: "Vous ne pouvez pas ajouter plus de 20 images au total.",
        variant: "destructive",
      })
      const allowedCount = 20 - existingImages.length - newImages.length
      if (allowedCount > 0) {
        setNewImages(prev => [...prev, ...files.slice(0, allowedCount)])
      }
      return
    }
    setNewImages(prev => [...prev, ...files])
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(f => f.type.startsWith("image/"))
      const totalImages = existingImages.length + newImages.length + files.length
      if (totalImages > 20) {
        toast({
          title: "Limite atteinte",
          description: "Vous ne pouvez pas ajouter plus de 20 images au total.",
          variant: "destructive",
        })
        const allowedCount = 20 - existingImages.length - newImages.length
        if (allowedCount > 0) {
          setNewImages(prev => [...prev, ...files.slice(0, allowedCount)])
        }
        return
      }
      setNewImages(prev => [...prev, ...files])
    }
  }

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/properties">
          <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {mode === "edit" ? "Modifier l'annonce" : "Nouvelle annonce"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "edit" ? "Modifiez les informations de l'annonce" : "Créez une nouvelle annonce immobilière"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Indicateur d'étapes - Style Tabs */}
          <div className="bg-secondary/95 p-1 rounded-lg">
            <div className="flex">
              {FORM_STEPS.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => handleStepClick(index)}
                  className={`
                    flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200
                    ${index === currentStep
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                    }
                  `}
                >
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{step.shortLabel}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contenu des étapes */}
          <div className="space-y-6">
            {/* Informations générales */}
            {currentStep === 0 && (
              <div className="space-y-6">
              <Card className="shadow-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">Informations de base</CardTitle>
                  <CardDescription>
                    Les informations principales de l&apos;annonce
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="reference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Référence *</FormLabel>
                          <FormControl>
                            <Input placeholder="AP-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Statut</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="DISPONIBLE">Disponible</SelectItem>
                              <SelectItem value="SOUS_COMPROMIS">Sous compromis</SelectItem>
                              <SelectItem value="SOUS_OFFRE">Sous offre</SelectItem>
                              <SelectItem value="VENDU">Vendu</SelectItem>
                              <SelectItem value="LOUE">Loué</SelectItem>
                              <SelectItem value="ARCHIVE">Archivé</SelectItem>
                              <SelectItem value="BROUILLON">Brouillon</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre de l&apos;annonce *</FormLabel>
                        <FormControl>
                          <Input placeholder="Appartement T3 avec balcon en centre-ville" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Décrivez le bien en détail..."
                            className="min-h-[120px] resize-y"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="propertyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type de bien *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="APPARTEMENT">Appartement</SelectItem>
                              <SelectItem value="MAISON">Maison</SelectItem>
                              <SelectItem value="VILLA">Villa</SelectItem>
                              <SelectItem value="TERRAIN">Terrain</SelectItem>
                              <SelectItem value="LOCAL_COMMERCIAL">Local commercial</SelectItem>
                              <SelectItem value="BUREAUX">Bureaux</SelectItem>
                              <SelectItem value="IMMEUBLE">Immeuble</SelectItem>
                              <SelectItem value="PARKING">Parking</SelectItem>
                              <SelectItem value="CAVE">Cave</SelectItem>
                              <SelectItem value="LOFT">Loft</SelectItem>
                              <SelectItem value="ATELIER">Atelier</SelectItem>
                              <SelectItem value="AUTRE">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="transactionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type de transaction *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="VENTE">Vente</SelectItem>
                              <SelectItem value="LOCATION">Location</SelectItem>
                              <SelectItem value="VIAGER">Viager</SelectItem>
                              <SelectItem value="LOCATION_SAISONNIERE">Location saisonnière</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">Prix et frais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prix *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="number" 
                                placeholder="250000" 
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                                className="pr-8" 
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="charges"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Charges mensuelles</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="number" 
                                placeholder="150" 
                                {...field} 
                                value={field.value ?? ""} 
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                className="pr-8" 
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="honorairesType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Honoraires à charge de</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="vendeur">Vendeur</SelectItem>
                              <SelectItem value="acquereur">Acquéreur</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {form.watch("honorairesType") === "acquereur" ? (
                      <FormField
                        control={form.control}
                        name="honorairesPct"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pourcentage honoraires</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="number" 
                                  step="0.01" 
                                  min="0" 
                                  max="100" 
                                  placeholder="4.76" 
                                  {...field} 
                                  value={field.value ?? ""}
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                  className="pr-8" 
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <FormField
                        control={form.control}
                        name="honoraires"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Honoraires</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="number" 
                                  placeholder="5000" 
                                  {...field} 
                                  value={field.value ?? ""}
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                  className="pr-8" 
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  
                  {/* Affichage du calcul prix hors honoraires */}
                  {form.watch("honorairesType") === "acquereur" && form.watch("price") && form.watch("honorairesPct") && (
                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                      <div className="grid gap-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Prix FAI (Frais d&apos;agence inclus)</span>
                          <span className="font-medium">{Number(form.watch("price")).toLocaleString("fr-FR")} €</span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-muted-foreground">Honoraires ({form.watch("honorairesPct")}%)</span>
                          <div className="flex items-center gap-2">
                            <FormField
                              control={form.control}
                              name="honoraires"
                              render={({ field }) => (
                                <div className="relative">
                                  <Input
                                    type="number"
                                    className="w-32 pr-8 text-right font-medium text-destructive"
                                    {...field}
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                                </div>
                              )}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const calculatedHonoraires = (Number(form.watch("price")) * Number(form.watch("honorairesPct"))) / (100 + Number(form.watch("honorairesPct")))
                                const roundedHonoraires = roundToNiceNumber(calculatedHonoraires)
                                form.setValue("honoraires", roundedHonoraires)
                              }}
                              title="Recalculer et arrondir"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Prix hors honoraires</span>
                          <span className="font-bold text-primary">
                            {(Number(form.watch("price")) - (form.watch("honoraires") ?? 0)).toLocaleString("fr-FR")} €
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">Localisation</CardTitle>
                  <CardDescription>
                    Commencez à taper l&apos;adresse pour voir des suggestions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="relative">
                        <FormLabel>Adresse *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                            <Input
                              ref={addressInputRef}
                              placeholder="12 rue de la République"
                              value={addressQuery}
                              onChange={(e) => {
                                const newValue = e.target.value
                                setAddressQuery(newValue)
                                field.onChange(newValue)
                                setShowAddressSuggestions(true)
                              }}
                              onFocus={() => {
                                if (addressSuggestions.length > 0) {
                                  setShowAddressSuggestions(true)
                                }
                              }}
                              className="pl-10"
                            />
                            {isLoadingAddresses && (
                              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                          </div>
                        </FormControl>
                        
                        {/* Dropdown des suggestions d'adresses avec animation */}
                        <div
                          ref={suggestionsRef}
                          className={`
                            absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden
                            transition-all duration-200 ease-out origin-top
                            ${showAddressSuggestions && addressSuggestions.length > 0
                              ? "opacity-100 scale-y-100 translate-y-0"
                              : "opacity-0 scale-y-95 -translate-y-1 pointer-events-none"
                            }
                          `}
                        >
                          {addressSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleAddressSelect(suggestion)}
                              className="w-full px-4 py-3 text-left hover:bg-primary/10 border-b border-border last:border-b-0 transition-colors duration-150"
                              style={{ animationDelay: `${index * 30}ms` }}
                            >
                              <div className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <div>
                                  <div className="font-medium text-foreground text-sm">
                                    {suggestion.label}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    {suggestion.context}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                        
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-5 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Code postal *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="69001" 
                              maxLength={5} 
                              {...field} 
                              className="bg-muted/30"
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Rempli automatiquement
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ville *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Lyon" 
                              {...field} 
                              className="bg-muted/30"
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Rempli automatiquement
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="neighborhood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quartier</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Terreaux" 
                              {...field} 
                              value={field.value ?? ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              </div>
            )}

            {/* Détails du bien */}
            {currentStep === 1 && (
              <div className="space-y-6">
              <Card className="shadow-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">Caractéristiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <FormField
                      control={form.control}
                      name="surface"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Surface habitable *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input type="number" placeholder="65" {...field} className="pr-10" />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">m²</span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="surfaceTerrain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Surface terrain</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="number" 
                                placeholder="500" 
                                {...field} 
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                className="pr-10" 
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">m²</span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="rooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pièces *</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chambres</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <FormField
                      control={form.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Salles de bain</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="floor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Étage</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={0} 
                              {...field} 
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="totalFloors"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre d&apos;étages</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={0} 
                              {...field} 
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="yearBuilt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Année de construction</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="1990" 
                              {...field} 
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">Équipements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <FormField
                      control={form.control}
                      name="hasBalcony"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <CheckboxField
                              label="Balcon"
                              checked={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasTerrace"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <CheckboxField
                              label="Terrasse"
                              checked={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasGarden"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <CheckboxField
                              label="Jardin"
                              checked={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasParking"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <CheckboxField
                              label="Parking"
                              checked={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasGarage"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <CheckboxField
                              label="Garage"
                              checked={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasCellar"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <CheckboxField
                              label="Cave"
                              checked={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasElevator"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <CheckboxField
                              label="Ascenseur"
                              checked={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasPool"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <CheckboxField
                              label="Piscine"
                              checked={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">Copropriété</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <FormField
                    control={form.control}
                    name="isInCopro"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <CheckboxField
                            label="Le bien est en copropriété"
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {form.watch("isInCopro") && (
                    <div className="grid gap-5 sm:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="coprLots"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre de lots</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={1} 
                                {...field} 
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="coprCharges"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Charges annuelles</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="number" 
                                  {...field} 
                                  value={field.value ?? ""}
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                  className="pr-8" 
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="coprProcedure"
                        render={({ field }) => (
                          <FormItem className="flex items-end pb-2">
                            <FormControl>
                              <CheckboxField
                                label="Procédure en cours"
                                checked={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
              </div>
            )}

            {/* DPE & Énergie */}
            {currentStep === 2 && (
              <div className="space-y-6">
              <Card className="shadow-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">Diagnostic de Performance Énergétique</CardTitle>
                  <CardDescription>
                    Informations obligatoires pour la vente ou la location
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="energyClass"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Classe énergie (DPE)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {["A", "B", "C", "D", "E", "F", "G", "VIERGE"].map((c) => (
                                <SelectItem key={c} value={c}>
                                  {c === "VIERGE" ? "Vierge" : c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="energyValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Consommation énergétique</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="number" 
                                placeholder="150" 
                                {...field} 
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                className="pr-24" 
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                                kWh/m²/an
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="gesClass"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Classe GES</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {["A", "B", "C", "D", "E", "F", "G", "VIERGE"].map((c) => (
                                <SelectItem key={c} value={c}>
                                  {c === "VIERGE" ? "Vierge" : c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gesValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Émissions GES</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="number" 
                                placeholder="25" 
                                {...field} 
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                className="pr-28" 
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                                kg CO₂/m²/an
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">Chauffage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="heatingType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type de chauffage</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="INDIVIDUEL">Individuel</SelectItem>
                              <SelectItem value="COLLECTIF">Collectif</SelectItem>
                              <SelectItem value="MIXTE">Mixte</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="heatingEnergy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Énergie de chauffage</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="GAZ">Gaz</SelectItem>
                              <SelectItem value="ELECTRIQUE">Électrique</SelectItem>
                              <SelectItem value="FIOUL">Fioul</SelectItem>
                              <SelectItem value="BOIS">Bois</SelectItem>
                              <SelectItem value="POMPE_A_CHALEUR">Pompe à chaleur</SelectItem>
                              <SelectItem value="GEOTHERMIE">Géothermie</SelectItem>
                              <SelectItem value="SOLAIRE">Solaire</SelectItem>
                              <SelectItem value="CHAUFFAGE_URBAIN">Chauffage urbain</SelectItem>
                              <SelectItem value="MIXTE">Mixte</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              </div>
            )}

            {/* Images */}
            {currentStep === 3 && (
              <div className="space-y-6">
              <Card className="shadow-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">Photos du bien</CardTitle>
                  <CardDescription>
                    Ajoutez jusqu&apos;à 20 photos. Cliquez sur l&apos;étoile pour définir l&apos;image principale.
                    <span className="block mt-1 text-xs">
                      {existingImages.length + newImages.length}/20 images
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Zone de drop */}
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleImageDrop}
                    onClick={() => document.getElementById("image-input")?.click()}
                  >
                    <input
                      id="image-input"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                    <ImagePlus className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-foreground font-medium">
                      Glissez-déposez vos images ici
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      ou cliquez pour sélectionner des fichiers
                    </p>
                  </div>

                  {/* Images existantes */}
                  {existingImages.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-foreground">Images enregistrées</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {existingImages.map((image) => (
                          <div key={image.id} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={image.url}
                              alt={image.alt || "Image du bien"}
                              className="w-full h-full object-cover"
                            />
                            {image.isMain && (
                              <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded font-medium flex items-center gap-1">
                                <Star className="h-3 w-3 fill-current" />
                                Principale
                              </span>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              {!image.isMain && (
                                <button
                                  type="button"
                                  onClick={() => setMainImage(image.id)}
                                  className="bg-white text-foreground p-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                                  title="Définir comme principale"
                                >
                                  <Star className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => deleteExistingImage(image.id)}
                                className="bg-white text-destructive p-2 rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nouvelles images (pas encore uploadées) */}
                  {newImages.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-foreground">
                        Nouvelles images à uploader
                        <span className="text-muted-foreground font-normal ml-2">
                          ({newImages.length} image{newImages.length > 1 ? "s" : ""})
                        </span>
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {newImages.map((image, index) => (
                          <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-dashed border-primary/50 bg-primary/5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Nouvelle image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-2 left-2 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded">
                              Nouveau
                            </span>
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              className="absolute top-2 right-2 bg-foreground/80 text-background p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              </div>
            )}
          </div>

          {/* Publication options - visible uniquement sur la dernière étape */}
          {isLastStep && (
          <Card className="shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Options de publication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <CheckboxField
                        label="Publier l'annonce immédiatement"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription className="ml-6">
                      L&apos;annonce sera visible sur le site public
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <CheckboxField
                        label="Mettre en avant"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription className="ml-6">
                      L&apos;annonce apparaîtra en premier sur la page d&apos;accueil
                    </FormDescription>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          )}

          {/* Actions - Navigation entre étapes */}
          <div className="flex justify-between items-center gap-3 pt-4 border-t border-border">
            <div className="flex gap-3">
              <Link href="/properties">
                <Button type="button" variant="ghost">
                  Annuler
                </Button>
              </Link>
            </div>
            
            <div className="flex gap-3">
              {/* Bouton Précédent */}
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreviousStep}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Précédent
                </Button>
              )}
              
              {/* Bouton Suivant ou Enregistrer */}
              {isLastStep ? (
                <Button
                  type="submit"
                  disabled={isLoading || isUploadingImages}
                  className="shadow-sm"
                >
                  {isLoading || isUploadingImages ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isUploadingImages ? "Upload des images..." : "Enregistrement..."}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {mode === "edit" ? "Enregistrer les modifications" : "Enregistrer"}
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="shadow-sm"
                >
                  Suivant
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}

