"use client"

import { useState, useRef, useEffect } from "react"
import {
  Loader2,
  Check,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Download,
  Edit3,
  Image as ImageIcon,
  Zap,
  FileText,
  AlertCircle,
  X,
  GripVertical,
  Building2,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react"
import { useAddressAutocomplete } from "@/components/admin/property-form/hooks/useAddressAutocomplete"
import type { AddressSuggestion } from "@/components/admin/property-form/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import html2canvas from "html2canvas"
import { waitForImages } from "@/lib/dom/wait-for-images"
import jsPDF from "jspdf"
import { DescriptiveSheetPreview } from "@/components/descriptive-sheets/DescriptiveSheetPreview"

interface PropertyImage {
  id: string
  url: string
  alt?: string
  order: number
  isMain: boolean
}

interface PropertyDocument {
  id: string
  name: string
  url: string
  type: string
  size?: number | null
  mimeType?: string | null
}

interface PropertyEnergy {
  id: string
  energyClass?: string | null
  energyValue?: number | null
  gesClass?: string | null
  gesValue?: number | null
  labelGenerated: boolean
  labelGeneratedAt?: string | null
  labelColor?: string | null
  descriptiveSheetGenerated: boolean
  descriptiveSheetGeneratedAt?: string | null
  heatingType?: string | null
  heatingEnergy?: string | null
}

// Helper pour extraire les URLs des documents
function getDocumentUrl(documents: PropertyDocument[] | undefined, type: string): string | null {
  if (!documents) return null
  const doc = documents.find(d => d.type === type)
  return doc?.url ?? null
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
  address?: string
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
  documents?: PropertyDocument[]
}

interface AgencyContacts {
  name: string
  address: string
  city: string
  postalCode: string
  phone: string
  email: string
}

interface EnergyPreview {
  dpeImageUrl: string | null
  gesImageUrl: string | null
  energyValue: number
  energyClass: string
  gesValue: number
  gesClass: string
}

interface DescriptiveSheetWizardProps {
  property: Property
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

const ENERGY_CLASSES = ["A", "B", "C", "D", "E", "F", "G"]

// Step indicator component
function StepIndicator({ 
  currentStep, 
  steps 
}: { 
  currentStep: number
  steps: { title: string; icon: React.ReactNode }[] 
}) {
  return (
    <div className="flex items-center justify-center gap-1 mb-6">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
              index < currentStep
                ? "bg-green-500 text-white"
                : index === currentStep
                ? "bg-primary text-white ring-4 ring-primary/20"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {index < currentStep ? (
              <Check className="h-4 w-4" />
            ) : (
              step.icon
            )}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-8 h-0.5 mx-1 transition-all duration-300 ${
                index < currentStep ? "bg-green-500" : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export function DescriptiveSheetWizard({
  property,
  isOpen,
  onClose,
  onComplete,
}: DescriptiveSheetWizardProps) {
  const { toast } = useToast()
  const sheetRef = useRef<HTMLDivElement>(null)

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("")
  const [showPreview, setShowPreview] = useState(true)

  // Step 1: Photo selection (exactly 3 photos)
  const [selectedPhotos, setSelectedPhotos] = useState<PropertyImage[]>([])

  // Step 2: Agency contacts
  const [agencyContacts, setAgencyContacts] = useState<AgencyContacts>({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    email: "",
  })

  // Autocomplete pour l'adresse de l'agence
  const handleAgencyAddressSelected = (suggestion: AddressSuggestion) => {
    const address = suggestion.street 
      ? `${suggestion.housenumber || ""} ${suggestion.street}`.trim()
      : suggestion.label.split(",")[0].trim()
    
    setAgencyContacts(prev => ({
      ...prev,
      address,
      postalCode: suggestion.postcode,
      city: suggestion.city,
    }))
  }

  const {
    addressQuery: agencyAddressQuery,
    setAddressQuery: setAgencyAddressQuery,
    addressSuggestions: agencyAddressSuggestions,
    isLoadingAddresses: isLoadingAgencyAddresses,
    showAddressSuggestions: showAgencyAddressSuggestions,
    setShowAddressSuggestions: setShowAgencyAddressSuggestions,
    addressInputRef: agencyAddressInputRef,
    suggestionsRef: agencyAddressSuggestionsRef,
    handleAddressSelect: handleAgencyAddressSelect,
  } = useAddressAutocomplete({
    initialAddress: agencyContacts.address,
    onAddressSelect: handleAgencyAddressSelected,
  })

  // Synchroniser agencyAddressQuery avec agencyContacts.address
  useEffect(() => {
    if (agencyContacts.address && agencyContacts.address !== agencyAddressQuery) {
      setAgencyAddressQuery(agencyContacts.address)
    }
  }, [agencyContacts.address, agencyAddressQuery, setAgencyAddressQuery])

  // Step 3: Description
  const [description, setDescription] = useState(property.description || "")

  // Step 4: DPE
  const [energyValue, setEnergyValue] = useState(property.energy?.energyValue || 0)
  const [energyClass, setEnergyClass] = useState(property.energy?.energyClass || "D")
  const [gesValue, setGesValue] = useState(property.energy?.gesValue || 0)
  const [gesClass, setGesClass] = useState(property.energy?.gesClass || "D")
  const [energyPreview, setEnergyPreview] = useState<EnergyPreview | null>(null)
  const [useExistingDpe, setUseExistingDpe] = useState(
    !!(getDocumentUrl(property.documents, "DPE_IMAGE") && getDocumentUrl(property.documents, "GES_IMAGE"))
  )

  const steps = [
    { title: "Sélection photos", icon: <ImageIcon className="h-4 w-4" /> },
    { title: "Contacts agence", icon: <Building2 className="h-4 w-4" /> },
    { title: "Description", icon: <Edit3 className="h-4 w-4" /> },
    { title: "DPE / GES", icon: <Zap className="h-4 w-4" /> },
    { title: "Génération", icon: <FileText className="h-4 w-4" /> },
  ]

  // Reset state when property changes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
      // Pre-select first 3 images (sorted by main photo first, then order)
      const initialPhotos = property.images
        .slice()
        .sort((a, b) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0) || a.order - b.order)
        .slice(0, 3)
      setSelectedPhotos(initialPhotos)
      setDescription(property.description || "")
      setEnergyValue(property.energy?.energyValue || 0)
      setEnergyClass(property.energy?.energyClass || "D")
      setGesValue(property.energy?.gesValue || 0)
      setGesClass(property.energy?.gesClass || "D")
      setEnergyPreview(null)
      setUseExistingDpe(!!(getDocumentUrl(property.documents, "DPE_IMAGE") && getDocumentUrl(property.documents, "GES_IMAGE")))
      
      // Fetch agency settings
      fetchAgencySettings()
    }
  }, [isOpen, property])

  // Fetch agency settings
  const fetchAgencySettings = async () => {
    try {
      const response = await fetch("/api/agency-settings")
      if (response.ok) {
        const data = await response.json()
        setAgencyContacts({
          name: data.name || "Cabinet Rimbault",
          address: data.address || "",
          city: data.city || "",
          postalCode: data.postalCode || "",
          phone: data.phone || "",
          email: data.email || "",
        })
      } else {
        // Use defaults
        setAgencyContacts({
          name: "Cabinet Rimbault",
          address: "",
          city: "",
          postalCode: "",
          phone: "",
          email: "",
        })
      }
    } catch (error) {
      console.error("Error fetching agency settings:", error)
      setAgencyContacts({
        name: "Cabinet Rimbault",
        address: "",
        city: "",
        postalCode: "",
        phone: "",
        email: "",
      })
    }
  }

  // Toggle photo selection (3 photos pour la fiche descriptive)
  const togglePhotoSelection = (image: PropertyImage) => {
    setSelectedPhotos((prev) => {
      const isSelected = prev.some((p) => p.id === image.id)
      if (isSelected) {
        return prev.filter((p) => p.id !== image.id)
      } else if (prev.length < 3) {
        // Sélection de 3 photos pour la fiche descriptive
        return [...prev, image]
      } else {
        // Maximum atteint, ne rien faire
        return prev
      }
    })
  }

  // Move photo in the order
  const movePhoto = (index: number, direction: "up" | "down") => {
    setSelectedPhotos((prev) => {
      const newArr = [...prev]
      const targetIndex = direction === "up" ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= newArr.length) return prev
      ;[newArr[index], newArr[targetIndex]] = [newArr[targetIndex], newArr[index]]
      return newArr
    })
  }

  // Remove photo from selection
  const removePhoto = (index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  // Fetch energy images (for DPE generation)
  const fetchEnergyImages = async () => {
    setIsLoading(true)
    setLoadingMessage("Génération des étiquettes DPE/GES...")

    try {
      const response = await fetch("/api/labels/preview-energy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          energyValue,
          energyClass,
          gesValue,
          gesClass,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de la génération")
      }

      const data = await response.json()
      setEnergyPreview(data.preview)
      
      toast({
        title: "Étiquettes DPE/GES générées",
        description: `Classe DPE : ${energyClass} • Classe GES : ${gesClass}`,
      })
    } catch (error) {
      console.error("Error fetching energy images:", error)
      toast({
        title: "Échec de la génération",
        description: error instanceof Error ? error.message : "Impossible de générer les étiquettes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setLoadingMessage("")
    }
  }

  // Generate final PDF
  const generatePDF = async () => {
    setIsLoading(true)
    setLoadingMessage("Préparation de la fiche descriptive...")

    try {
      // Wait for React to render
      // Idem : on attend le chargement effectif des étiquettes DPE/GES
      // (SVG Supabase cross-origin) plutôt qu'un délai fixe.
      await waitForImages(sheetRef.current)

      // Generate PDF from canvas
      if (sheetRef.current) {
        setLoadingMessage("Génération du PDF...")
        const canvas = await html2canvas(sheetRef.current, {
          scale: 1.5, // Réduit de 2 à 1.5 pour des fichiers plus petits
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
        })

        // Utiliser JPEG au lieu de PNG pour une meilleure compression
        const imgData = canvas.toDataURL("image/jpeg", 0.85) // 85% de qualité
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
          compress: true, // Activer la compression
        })

        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        const imgWidth = canvas.width
        const imgHeight = canvas.height
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
        const imgX = (pdfWidth - imgWidth * ratio) / 2
        const imgY = 0

        pdf.addImage(imgData, "JPEG", imgX, imgY, imgWidth * ratio, imgHeight * ratio, undefined, "FAST")

        // Get PDF as blob
        const pdfBlob = pdf.output("blob")
        
        console.log(`PDF généré: ${(pdfBlob.size / 1024 / 1024).toFixed(2)} MB`)

        // Upload PDF to Supabase
        setLoadingMessage("Upload du PDF...")
        const formData = new FormData()
        formData.append("pdf", pdfBlob, `fiche_descriptive_${property.reference}.pdf`)
        formData.append("propertyId", property.id)

        const uploadResponse = await fetch("/api/descriptive-sheets/upload-pdf", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json().catch(() => ({}))
          console.error("Failed to upload PDF:", errorData)
          toast({
            title: "PDF généré mais non uploadé",
            description: "Le PDF a été téléchargé localement mais l'upload a échoué.",
            variant: "destructive",
          })
        }

        // Download PDF
        pdf.save(`fiche_descriptive_${property.reference}.pdf`)

        toast({
          title: "Fiche descriptive générée",
          description: `Le fichier "fiche_descriptive_${property.reference}.pdf" a été téléchargé.`,
        })

        setCurrentStep(4)
      }
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Échec de la génération",
        description: error instanceof Error ? error.message : "Impossible de générer le PDF",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setLoadingMessage("")
    }
  }

  const handleClose = () => {
    if (currentStep === 4) {
      onComplete()
    }
    onClose()
  }

  const canProceedFromStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return selectedPhotos.length >= 3
      case 1:
        return agencyContacts.name.length > 0 && agencyContacts.phone.length > 0
      case 2:
        return description.trim().length >= 50
      case 3:
        return useExistingDpe || !!energyPreview
      default:
        return true
    }
  }

  // Get effective DPE URLs
  const getEffectiveDpeUrls = () => {
    const dpeFromDocs = getDocumentUrl(property.documents, "DPE_IMAGE")
    const gesFromDocs = getDocumentUrl(property.documents, "GES_IMAGE")
    
    if (useExistingDpe && dpeFromDocs) {
      return {
        dpeImageUrl: dpeFromDocs,
        gesImageUrl: gesFromDocs,
      }
    }
    return {
      dpeImageUrl: energyPreview?.dpeImageUrl || null,
      gesImageUrl: energyPreview?.gesImageUrl || null,
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`max-h-[90vh] overflow-y-auto transition-all duration-300 ${showPreview && currentStep < 4 ? "max-w-6xl" : "max-w-4xl"}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Fiche descriptive - {property.reference}
            </div>
            {currentStep < 4 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="text-muted-foreground hover:text-foreground"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Masquer aperçu
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Afficher aperçu
                  </>
                )}
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            {steps[currentStep]?.title}
          </DialogDescription>
        </DialogHeader>

        <StepIndicator currentStep={currentStep} steps={steps} />
        
        <div className={`flex gap-6 ${showPreview && currentStep < 4 ? "" : ""}`}>
          {/* Main wizard content */}
          <div className={`${showPreview && currentStep < 4 ? "flex-1 min-w-0" : "w-full"}`}>

        {/* Step 0: Photo Selection */}
        {currentStep === 0 && (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <ImageIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Sélection des photos</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Choisissez 3 photos qui apparaîtront sur la fiche descriptive. La photo du milieu sera mise en avant.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Left: Available photos */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Photos disponibles ({property.images.length})</h4>
                {property.images.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-1">
                    {property.images.map((img) => {
                      const isSelected = selectedPhotos.some((p) => p.id === img.id)
                      const selectionIndex = selectedPhotos.findIndex((p) => p.id === img.id)
                      return (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => togglePhotoSelection(img)}
                          disabled={false}
                          className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${
                            isSelected
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-transparent hover:border-muted-foreground/30"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.url}
                            alt={img.alt || `Photo ${img.order + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                              {selectionIndex + 1}
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/30">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">Aucune photo disponible</p>
                  </div>
                )}
              </div>

              {/* Right: Selected photos with order */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm flex items-center justify-between">
                  <span>Photos sélectionnées ({selectedPhotos.length}/3)</span>
                  {selectedPhotos.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPhotos([])}
                      className="text-xs h-7"
                    >
                      Effacer
                    </Button>
                  )}
                </h4>
                
                {selectedPhotos.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPhotos.map((photo, index) => {
                      const positionLabels = ["📷 Gauche", "⭐ Milieu (mise en avant)", "📷 Droite"]
                      const positionLabel = positionLabels[index] || `Photo ${index + 1}`
                      return (
                        <div
                          key={photo.id}
                          className={`flex items-center gap-3 p-2 rounded-lg border ${
                            index === 1 ? "bg-primary/5 border-primary/30" : "bg-muted/50"
                          }`}
                        >
                          <div className="flex flex-col gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => movePhoto(index, "up")}
                              disabled={index === 0}
                            >
                              <ChevronUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => movePhoto(index, "down")}
                              disabled={index === selectedPhotos.length - 1}
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className={`rounded overflow-hidden flex-shrink-0 ${index === 1 ? "w-20 h-20" : "w-16 h-16"}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photo.url}
                              alt={photo.alt || `Photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">
                              {positionLabel}
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removePhoto(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted-foreground/30 rounded-lg">
                    <GripVertical className="h-8 w-8 text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">Cliquez sur les photos pour les sélectionner</p>
                  </div>
                )}

                {selectedPhotos.length < 3 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-700">
                      <AlertCircle className="h-3 w-3 inline mr-1" />
                      Sélectionnez 3 photos ({3 - selectedPhotos.length} restante{3 - selectedPhotos.length > 1 ? "s" : ""})
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Agency Contacts */}
        {currentStep === 1 && (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Contacts de l&apos;agence</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Vérifiez et modifiez les informations de contact qui apparaîtront sur la fiche.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="col-span-2">
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4" />
                  Nom de l&apos;agence
                </label>
                <Input
                  value={agencyContacts.name}
                  onChange={(e) => setAgencyContacts(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Cabinet Rimbault"
                />
              </div>

              <div className="col-span-2 relative">
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4" />
                  Adresse
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Input
                    ref={agencyAddressInputRef}
                    value={agencyAddressQuery}
                    onChange={(e) => {
                      const newValue = e.target.value
                      setAgencyAddressQuery(newValue)
                      setAgencyContacts(prev => ({ ...prev, address: newValue }))
                      setShowAgencyAddressSuggestions(true)
                    }}
                    onFocus={() => {
                      if (agencyAddressSuggestions.length > 0) {
                        setShowAgencyAddressSuggestions(true)
                      }
                    }}
                    placeholder="123 rue de l'Immobilier"
                    className="pl-10"
                  />
                  {isLoadingAgencyAddresses && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                
                {/* Dropdown des suggestions d'adresses avec animation */}
                <div
                  ref={agencyAddressSuggestionsRef}
                  className={`
                    absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden
                    transition-all duration-200 ease-out origin-top
                    ${showAgencyAddressSuggestions && agencyAddressSuggestions.length > 0
                      ? "opacity-100 scale-y-100 translate-y-0"
                      : "opacity-0 scale-y-95 -translate-y-1 pointer-events-none"
                    }
                  `}
                >
                  {agencyAddressSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleAgencyAddressSelect(suggestion)}
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
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Ville</label>
                <Input
                  value={agencyContacts.city}
                  onChange={(e) => setAgencyContacts(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Paris"
                  className="bg-muted/30"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Code postal</label>
                <Input
                  value={agencyContacts.postalCode}
                  onChange={(e) => setAgencyContacts(prev => ({ ...prev, postalCode: e.target.value }))}
                  placeholder="75001"
                  className="bg-muted/30"
                />
              </div>

              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Phone className="h-4 w-4" />
                  Téléphone
                </label>
                <Input
                  value={agencyContacts.phone}
                  onChange={(e) => setAgencyContacts(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="01 23 45 67 89"
                />
              </div>

              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <Input
                  type="email"
                  value={agencyContacts.email}
                  onChange={(e) => setAgencyContacts(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contact@cabinet-rimbault.fr"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Description */}
        {currentStep === 2 && (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Edit3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Description du bien</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Vérifiez et modifiez la description qui apparaîtra sur la fiche descriptive.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Description</label>
                <span className={`text-xs ${description.length >= 50 ? "text-green-600" : "text-amber-600"}`}>
                  {description.length} caractères (min. 50)
                </span>
              </div>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez le bien..."
                className="min-h-[200px] resize-none"
              />
              {description.length < 50 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700">
                    <AlertCircle className="h-3 w-3 inline mr-1" />
                    La description doit contenir au moins 50 caractères
                  </p>
                </div>
              )}
            </div>

            {/* Property info summary */}
            <div className="p-4 bg-muted/50 rounded-lg text-sm">
              <p className="font-medium mb-2">Informations du bien :</p>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <div>Surface : {property.characteristics?.surface || "N/A"} m²</div>
                <div>Pièces : {property.characteristics?.rooms || "N/A"}</div>
                <div>Chambres : {property.characteristics?.bedrooms || "N/A"}</div>
                <div>Prix : {property.finance?.price?.toLocaleString("fr-FR") || "N/A"} €</div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: DPE */}
        {currentStep === 3 && (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Diagnostic énergétique</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                {getDocumentUrl(property.documents, "DPE_IMAGE")
                  ? "Vous pouvez réutiliser le DPE existant ou en générer un nouveau."
                  : "Générez les étiquettes DPE et GES pour la fiche descriptive."
                }
              </p>
            </div>

            {/* Option to use existing DPE */}
            {getDocumentUrl(property.documents, "DPE_IMAGE") && getDocumentUrl(property.documents, "GES_IMAGE") && (
              <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <input
                  type="checkbox"
                  id="useExisting"
                  checked={useExistingDpe}
                  onChange={(e) => setUseExistingDpe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="useExisting" className="flex-1">
                  <span className="font-medium text-blue-800">Utiliser le DPE existant</span>
                  <p className="text-sm text-blue-600">
                    DPE déjà généré pour l&apos;étiquette vitrine (Classe {property.energy?.energyClass})
                  </p>
                </label>
                {useExistingDpe && (
                  <div className="flex gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={getDocumentUrl(property.documents, "DPE_IMAGE") || ""} 
                      alt="DPE" 
                      className="h-16 w-auto rounded"
                    />
                    {getDocumentUrl(property.documents, "GES_IMAGE") && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={getDocumentUrl(property.documents, "GES_IMAGE") || ""} 
                        alt="GES" 
                        className="h-16 w-auto rounded"
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Generate new DPE */}
            {!useExistingDpe && (
              <>
                <div className="grid grid-cols-2 gap-6 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold">
                        DPE
                      </span>
                      Diagnostic de Performance Énergétique
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Valeur (kWh/m²/an)</label>
                        <Input
                          type="number"
                          value={energyValue}
                          onChange={(e) => setEnergyValue(Number(e.target.value))}
                          min={0}
                          max={999}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Classe</label>
                        <Select value={energyClass} onValueChange={setEnergyClass}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ENERGY_CLASSES.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 text-white text-xs font-bold">
                        GES
                      </span>
                      Gaz à Effet de Serre
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Valeur (kg CO₂/m²/an)</label>
                        <Input
                          type="number"
                          value={gesValue}
                          onChange={(e) => setGesValue(Number(e.target.value))}
                          min={0}
                          max={999}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Classe</label>
                        <Select value={gesClass} onValueChange={setGesClass}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ENERGY_CLASSES.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button onClick={fetchEnergyImages} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Génération...
                      </>
                    ) : energyPreview ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regénérer les étiquettes
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Générer les étiquettes
                      </>
                    )}
                  </Button>
                </div>

                {/* Preview generated DPE */}
                {energyPreview && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm font-medium text-green-800 mb-2">DPE - Classe {energyPreview.energyClass}</p>
                      {energyPreview.dpeImageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={energyPreview.dpeImageUrl}
                          alt="DPE"
                          className="max-h-32 mx-auto rounded"
                        />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-green-800 mb-2">GES - Classe {energyPreview.gesClass}</p>
                      {energyPreview.gesImageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={energyPreview.gesImageUrl}
                          alt="GES"
                          className="max-h-32 mx-auto rounded"
                        />
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-6 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">{loadingMessage}</p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Complete */}
        {currentStep === 4 && (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-4">
                <Check className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fiche descriptive générée !</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                La fiche descriptive a été téléchargée et sauvegardée.
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span>3 photos sélectionnées</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span>DPE inclus</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span>PDF téléchargé</span>
              </div>
            </div>
          </div>
        )}
          </div>

          {/* Mini Preview Panel */}
          {showPreview && currentStep < 4 && (
            <div className="w-[280px] flex-shrink-0 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Eye className="h-4 w-4" />
                Aperçu en temps réel
              </div>
              <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                {/* A4 portrait ratio: 210mm x 297mm = 1:1.414, scaled to fit */}
                <div 
                  className="overflow-hidden"
                  style={{ 
                    width: "260px",
                    height: "368px", // 260 * 1.414
                  }}
                >
                  <div 
                    className="origin-top-left"
                    style={{ 
                      transform: "scale(0.31)",
                      width: "839px", // A4 at 96dpi = 794px, but we use the component's actual width
                      transformOrigin: "top left"
                    }}
                  >
                    <DescriptiveSheetPreview
                      property={property}
                      selectedPhotos={selectedPhotos}
                      agencyContacts={agencyContacts}
                      description={description}
                      dpeImageUrl={getEffectiveDpeUrls().dpeImageUrl}
                      gesImageUrl={getEffectiveDpeUrls().gesImageUrl}
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                La fiche se met à jour en temps réel
              </p>
            </div>
          )}
        </div>

        {/* Hidden preview for PDF generation */}
        {currentStep === 3 && (
          <div className="fixed left-[-9999px] top-0">
            <DescriptiveSheetPreview
              ref={sheetRef}
              property={property}
              selectedPhotos={selectedPhotos}
              agencyContacts={agencyContacts}
              description={description}
              dpeImageUrl={getEffectiveDpeUrls().dpeImageUrl}
              gesImageUrl={getEffectiveDpeUrls().gesImageUrl}
            />
          </div>
        )}

        <DialogFooter className="gap-2">
          {currentStep === 0 && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button onClick={() => setCurrentStep(1)} disabled={!canProceedFromStep(0)}>
                Continuer
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </>
          )}

          {currentStep === 1 && (
            <>
              <Button variant="outline" onClick={() => setCurrentStep(0)}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <Button onClick={() => setCurrentStep(2)} disabled={!canProceedFromStep(1)}>
                Continuer
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </>
          )}

          {currentStep === 2 && (
            <>
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <Button onClick={() => setCurrentStep(3)} disabled={!canProceedFromStep(2)}>
                Continuer
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </>
          )}

          {currentStep === 3 && (
            <>
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <Button onClick={generatePDF} disabled={!canProceedFromStep(3) || isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Générer et télécharger
                  </>
                )}
              </Button>
            </>
          )}

          {currentStep === 4 && (
            <Button onClick={handleClose}>
              <Check className="h-4 w-4 mr-2" />
              Terminer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

