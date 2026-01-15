"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  FileText, 
  Eye, 
  RefreshCw, 
  AlertTriangle, 
  Check, 
  Loader2,
  Filter,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { DescriptiveSheetWizard } from "@/components/descriptive-sheets/DescriptiveSheetWizard"

interface PropertyImage {
  id: string
  url: string
  alt?: string
  order: number
  isMain: boolean
}

interface PropertyEnergy {
  id: string
  energyClass?: string | null
  energyValue?: number | null
  gesClass?: string | null
  gesValue?: number | null
  dpeImageUrl?: string | null
  gesImageUrl?: string | null
  labelGenerated: boolean
  labelGeneratedAt?: string | null
  labelPdfUrl?: string | null
  labelColor?: string | null
  descriptiveSheetGenerated: boolean
  descriptiveSheetGeneratedAt?: string | null
  descriptiveSheetPdfUrl?: string | null
  heatingType?: string | null
  heatingEnergy?: string | null
}

interface PropertyFinance {
  price: number
  honoraires?: number | null
  honorairesType?: string | null
  honorairesPct?: number | null
  taxeFonciere?: number | null
}

interface PropertyLocation {
  city: string
  postalCode: string
  neighborhood?: string | null
}

interface PropertyCharacteristics {
  surface: number
  surfaceCarrez?: number | null
  rooms: number
  bedrooms: number
  bathrooms: number
  floor?: number | null
  totalFloors?: number | null
  surfaceTerrain?: number | null
  surfaceSejour?: number | null
  surfaceBalcon?: number | null
  surfaceCave?: number | null
  yearBuilt?: number | null
  orientation?: string | null
}

interface PropertyAmenities {
  hasBalcony?: boolean
  balconyCount?: number | null
  hasTerrace?: boolean
  hasGarden?: boolean
  hasParking?: boolean
  parkingSpaces?: number | null
  hasGarage?: boolean
  hasCellar?: boolean
  cellarCount?: number | null
  hasElevator?: boolean
  hasPool?: boolean
}

interface PropertyCopro {
  isInCopro?: boolean
  coprLots?: number | null
  coprCharges?: number | null
}

interface Property {
  id: string
  reference: string
  title: string
  description: string
  propertyType: string
  transactionType: string
  status: string
  standing?: string | null
  finance: PropertyFinance | null
  location: PropertyLocation | null
  characteristics: PropertyCharacteristics | null
  amenities: PropertyAmenities | null
  energy: PropertyEnergy | null
  copro: PropertyCopro | null
  images: PropertyImage[]
}

export default function DescriptiveSheetsPage() {
  const { toast } = useToast()
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sheetFilter, setSheetFilter] = useState<"all" | "generated" | "not_generated">("all")
  const [previewProperty, setPreviewProperty] = useState<Property | null>(null)
  
  // Wizard state
  const [wizardProperty, setWizardProperty] = useState<Property | null>(null)
  const [showWizard, setShowWizard] = useState(false)
  
  // Validation errors
  const [validationError, setValidationError] = useState<string | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  const fetchProperties = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/properties?descriptiveSheetFilter=${sheetFilter}`)
      if (!response.ok) throw new Error("Erreur lors du chargement")
      const data = await response.json()
      setProperties(data)
      
      // Message selon le filtre appliqué
      const filterMessage = sheetFilter === "generated" 
        ? "avec fiche descriptive générée"
        : sheetFilter === "not_generated"
        ? "sans fiche descriptive"
        : ""
      
      if (data.length > 0) {
        toast({
          title: "Annonces chargées",
          description: `${data.length} annonce${data.length > 1 ? "s" : ""} ${filterMessage}`.trim(),
        })
      }
    } catch (error) {
      console.error("Error fetching properties:", error)
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les annonces. Vérifiez votre connexion.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [sheetFilter, toast])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  const validatePropertyForSheet = (property: Property): string | null => {
    if (property.images.length < 3) {
      return "Au moins 3 photos sont requises pour générer une fiche descriptive"
    }
    if (!property.description || property.description.trim().length < 50) {
      return "Une description d'au moins 50 caractères est requise"
    }
    return null
  }

  const handleOpenWizard = (property: Property) => {
    const error = validatePropertyForSheet(property)
    if (error) {
      setValidationError(error)
      setSelectedProperty(property)
      return
    }
    
    setWizardProperty(property)
    setShowWizard(true)
  }

  const handleWizardComplete = () => {
    toast({
      title: "Fiche descriptive sauvegardée",
      description: `La fiche descriptive pour "${wizardProperty?.reference}" a été enregistrée avec succès.`,
    })
    fetchProperties()
    setShowWizard(false)
    setWizardProperty(null)
  }

  const handleDownloadExisting = (property: Property) => {
    if (property.energy?.descriptiveSheetPdfUrl) {
      // Open the PDF in a new tab
      window.open(property.energy.descriptiveSheetPdfUrl, "_blank")
      toast({
        title: "PDF ouvert",
        description: `La fiche descriptive "${property.reference}" s'ouvre dans un nouvel onglet.`,
      })
    } else {
      // Open wizard to regenerate
      toast({
        title: "PDF non disponible",
        description: "Veuillez régénérer la fiche descriptive pour obtenir le PDF.",
        variant: "destructive",
      })
      handleOpenWizard(property)
    }
  }

  const filteredProperties = properties

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Fiches descriptives</h1>
          <p className="text-muted-foreground mt-1">
            Générez des fiches descriptives PDF pour vos annonces
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select 
              value={sheetFilter} 
              onValueChange={(v) => setSheetFilter(v as typeof sheetFilter)}
            >
              <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Toutes les annonces</SelectItem>
                <SelectItem value="generated">Fiches générées</SelectItem>
                <SelectItem value="not_generated">Sans fiche</SelectItem>
            </SelectContent>
          </Select>
          </div>
        </div>
      </div>

      {/* Properties List */}
        <Card className="shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Annonces</CardTitle>
              <CardDescription>
            {filteredProperties.length} annonce(s) • Cliquez sur &quot;Générer&quot; pour créer une fiche descriptive
              </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="h-10 w-10 mb-4" />
              <p>Aucune annonce trouvée</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProperties.map((property) => {
                const hasEnoughPhotos = property.images.length >= 1
                const hasDescription = property.description && property.description.trim().length >= 50
                const canGenerate = hasEnoughPhotos && hasDescription
                const hasExistingDpe = property.energy?.dpeImageUrl && property.energy?.gesImageUrl

              return (
                <div
                  key={property.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-muted-foreground/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                      {/* Thumbnail */}
                      <div className="h-16 w-16 rounded-md bg-muted overflow-hidden shrink-0">
                        {property.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={property.images[0].url}
                            alt={property.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                    </div>

                      {/* Info */}
                    <div>
                        <p className="font-medium text-foreground">{property.title}</p>
                      <p className="text-sm text-muted-foreground">
                          {property.reference} • {property.location?.city ?? "N/A"} • {property.finance?.price?.toLocaleString("fr-FR") ?? "N/A"} €
                      </p>
                        <div className="flex items-center gap-2 mt-1">
                          {/* Photos Status */}
                    <Badge
                      variant="outline"
                            className={`text-xs ${
                              hasEnoughPhotos 
                          ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {hasEnoughPhotos ? (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                {property.images.length} photo{property.images.length > 1 ? "s" : ""}
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Aucune photo
                              </>
                            )}
                          </Badge>
                          
                          {/* DPE Status */}
                          {hasExistingDpe && (
                            <Badge 
                              variant="outline" 
                              className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              DPE disponible
                            </Badge>
                          )}
                          
                          {/* Sheet Status */}
                          {property.energy?.descriptiveSheetGenerated && (
                            <Badge 
                              variant="outline" 
                              className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              Fiche générée
                    </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                        className="h-9 w-9"
                        onClick={() => setPreviewProperty(property)}
                        title="Aperçu"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                      {property.energy?.descriptiveSheetGenerated ? (
                        <>
                          {property.energy?.descriptiveSheetPdfUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadExisting(property)}
                              title="Voir le PDF"
                          >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Voir PDF
                          </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenWizard(property)}
                            title="Recréer la fiche"
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Recréer
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleOpenWizard(property)}
                          disabled={!canGenerate}
                          className="shadow-sm"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Générer
                        </Button>
                      )}
                  </div>
                </div>
              )
            })}
            </div>
          )}
          </CardContent>
        </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewProperty} onOpenChange={() => setPreviewProperty(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aperçu - {previewProperty?.reference}</DialogTitle>
            <DialogDescription>{previewProperty?.title}</DialogDescription>
          </DialogHeader>
          {previewProperty && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Prix :</span>{" "}
                  <strong>{previewProperty.finance?.price?.toLocaleString("fr-FR") ?? "N/A"} €</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Surface :</span>{" "}
                  <strong>{previewProperty.characteristics?.surface ?? "N/A"} m²</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">DPE :</span>{" "}
                  <strong>{previewProperty.energy?.energyClass || "Non renseigné"}</strong>
                  {previewProperty.energy?.energyValue && ` (${previewProperty.energy.energyValue} kWh/m²/an)`}
                </div>
                <div>
                  <span className="text-muted-foreground">GES :</span>{" "}
                  <strong>{previewProperty.energy?.gesClass || "Non renseigné"}</strong>
                  {previewProperty.energy?.gesValue && ` (${previewProperty.energy.gesValue} kg CO₂/m²/an)`}
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Photos :</span>{" "}
                  <strong>{previewProperty.images.length} photo(s) disponible(s)</strong>
                </div>
              </div>
              {previewProperty.description && (
                <div>
                  <span className="text-sm text-muted-foreground">Description :</span>
                  <p className="mt-1 text-sm line-clamp-4">{previewProperty.description}</p>
                </div>
              )}
              {previewProperty.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {previewProperty.images.slice(0, 4).map((img, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={img.id}
                      src={img.url}
                      alt={`Photo ${i + 1}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Validation Error Dialog */}
      <Dialog open={!!validationError} onOpenChange={() => setValidationError(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Données manquantes
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">{validationError}</p>
            <p className="mt-2 text-sm">
              Veuillez compléter les informations de l&apos;annonce{" "}
              <strong>{selectedProperty?.reference}</strong> avant de générer la fiche descriptive.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setValidationError(null)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Descriptive Sheet Generation Wizard */}
      {wizardProperty && (
        <DescriptiveSheetWizard
          property={wizardProperty}
          isOpen={showWizard}
          onClose={() => {
            setShowWizard(false)
            setWizardProperty(null)
          }}
          onComplete={handleWizardComplete}
        />
      )}
    </div>
  )
}

