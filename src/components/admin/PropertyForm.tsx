"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Save, Loader2, ImagePlus, X, Star, Trash2, RefreshCw } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

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
    }
  }, [initialData, form])

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

      // Upload des nouvelles images si présentes
      const targetPropertyId = mode === "edit" ? propertyId : result.id
      if (newImages.length > 0 && targetPropertyId) {
        setIsUploadingImages(true)
        try {
          await uploadImages(targetPropertyId, newImages)
        } catch (uploadError) {
          console.error("Error uploading images:", uploadError)
          toast({
            title: "Attention",
            description: "L'annonce a été enregistrée mais certaines images n'ont pas pu être uploadées.",
            variant: "destructive",
          })
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

  // Fonction pour uploader les images
  async function uploadImages(targetPropertyId: string, files: File[]) {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append("images", file)
    })

    const response = await fetch(`/api/properties/${targetPropertyId}/images`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Erreur lors de l'upload des images")
    }

    return response.json()
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
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="bg-secondary/95 p-1 h-auto">
              <TabsTrigger value="general" className="data-[state=active]:bg-card data-[state=active]:shadow-sm px-4 py-2">
                Informations générales
              </TabsTrigger>
              <TabsTrigger value="details" className="data-[state=active]:bg-card data-[state=active]:shadow-sm px-4 py-2">
                Détails du bien
              </TabsTrigger>
              <TabsTrigger value="dpe" className="data-[state=active]:bg-card data-[state=active]:shadow-sm px-4 py-2">
                DPE & Énergie
              </TabsTrigger>
              <TabsTrigger value="images" className="data-[state=active]:bg-card data-[state=active]:shadow-sm px-4 py-2">
                Images
              </TabsTrigger>
            </TabsList>

            {/* Informations générales */}
            <TabsContent value="general" className="space-y-6 mt-6">
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
                              <Input type="number" placeholder="250000" {...field} className="pr-8" />
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
                </CardHeader>
                <CardContent className="space-y-5">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse *</FormLabel>
                        <FormControl>
                          <Input placeholder="12 rue de la République" {...field} />
                        </FormControl>
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
                            <Input placeholder="69001" maxLength={5} {...field} />
                          </FormControl>
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
                            <Input placeholder="Lyon" {...field} />
                          </FormControl>
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
            </TabsContent>

            {/* Détails du bien */}
            <TabsContent value="details" className="space-y-6 mt-6">
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
            </TabsContent>

            {/* DPE & Énergie */}
            <TabsContent value="dpe" className="space-y-6 mt-6">
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
            </TabsContent>

            {/* Images */}
            <TabsContent value="images" className="space-y-6 mt-6">
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
            </TabsContent>
          </Tabs>

          {/* Publication options */}
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

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Link href="/properties">
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </Link>
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
          </div>
        </form>
      </Form>
    </div>
  )
}

