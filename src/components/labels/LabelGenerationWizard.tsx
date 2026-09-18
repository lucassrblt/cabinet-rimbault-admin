"use client";

import { useState, useRef, useEffect } from "react";
import {
  Loader2,
  Check,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Download,
  Edit3,
  Eye,
  Palette,
  Image as ImageIcon,
  FileText,
  X,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import { waitForImages } from "@/lib/dom/wait-for-images";
import jsPDF from "jspdf";
import {
  LabelPreview,
  type LabelProperty,
} from "@/components/labels/LabelPreview";

interface PropertyImage {
  id: string;
  url: string;
  alt?: string;
  order: number;
  isMain: boolean;
}

interface PropertyDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: number | null;
  mimeType?: string | null;
}

interface PropertyEnergy {
  id: string;
  energyClass?: string | null;
  energyValue?: number | null;
  gesClass?: string | null;
  gesValue?: number | null;
  /** Énergie finale affichée sur l'étiquette DPE ; absente sur les biens anciens. */
  finalEnergyValue?: number | null;
  /** Dépenses annuelles estimées, abonnements compris, pour la mention légale. */
  annualEnergyCostMin?: number | null;
  annualEnergyCostMax?: number | null;
  dateReferenceEnergie?: string | null;
  dpeDate?: string | null;
  labelGenerated: boolean;
  labelGeneratedAt?: string | null;
  labelColor?: string | null;
}

// Helper pour extraire les URLs des documents
function getDocumentUrl(
  documents: PropertyDocument[] | undefined,
  type: string,
): string | null {
  if (!documents) return null;
  const doc = documents.find((d) => d.type === type);
  return doc?.url ?? null;
}

interface PropertyFinance {
  price: number;
  honoraires?: number | null;
  honorairesType?: string | null;
  honorairesPct?: number | null;
}

interface PropertyLocation {
  city: string;
  postalCode: string;
  neighborhood?: string | null;
}

interface PropertyCharacteristics {
  surface: number;
  surfaceCarrez?: number | null;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  floor?: number | null;
  totalFloors?: number | null;
  surfaceTerrain?: number | null;
  surfaceSejour?: number | null;
  surfaceBalcon?: number | null;
  surfaceCave?: number | null;
}

interface PropertyAmenities {
  hasBalcony?: boolean;
  hasTerrace?: boolean;
  hasGarden?: boolean;
  hasParking?: boolean;
  hasGarage?: boolean;
  hasCellar?: boolean;
  hasElevator?: boolean;
  hasPool?: boolean;
}

interface PropertyCopro {
  isInCopro?: boolean;
  coprLots?: number | null;
  coprCharges?: number | null;
}

interface Property {
  id: string;
  reference: string;
  title: string;
  description: string;
  propertyType: string;
  transactionType: string;
  status: string;
  isExclusive?: boolean;
  finance: PropertyFinance | null;
  location: PropertyLocation | null;
  characteristics: PropertyCharacteristics | null;
  amenities: PropertyAmenities | null;
  energy: PropertyEnergy | null;
  copro: PropertyCopro | null;
  images: PropertyImage[];
  documents?: PropertyDocument[];
}

interface LabelGenerationWizardProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  /** `saved` indique si le PDF a bien été enregistré sur l'annonce. */
  onComplete: (saved: boolean) => void;
  defaultColor?: string;
}

const DEFAULT_COLOR = "#780000";

// Helper function to transform nested property to flat LabelProperty format
function toFlatLabelProperty(
  property: Property,
  overrides?: {
    energyValue?: number;
    energyClass?: string;
    gesValue?: number;
    gesClass?: string;
    dpeImageUrl?: string | null;
    gesImageUrl?: string | null;
  },
): LabelProperty {
  // Get document URLs
  const dpeImageUrlFromDocs = getDocumentUrl(property.documents, "DPE_IMAGE");
  const gesImageUrlFromDocs = getDocumentUrl(property.documents, "GES_IMAGE");

  return {
    reference: property.reference,
    title: property.title,
    description: property.description,
    propertyType: property.propertyType,
    transactionType: property.transactionType,
    status: property.status,
    price: property.finance?.price || 0,
    city: property.location?.city || "",
    postalCode: property.location?.postalCode || "",
    neighborhood: property.location?.neighborhood,
    surface: property.characteristics?.surface || 0,
    surfaceCarrez: property.characteristics?.surfaceCarrez,
    rooms: property.characteristics?.rooms || 0,
    bedrooms: property.characteristics?.bedrooms || 0,
    bathrooms: property.characteristics?.bathrooms || 0,
    floor: property.characteristics?.floor,
    totalFloors: property.characteristics?.totalFloors,
    surfaceTerrain: property.characteristics?.surfaceTerrain,
    surfaceSejour: property.characteristics?.surfaceSejour,
    surfaceBalcon: property.characteristics?.surfaceBalcon,
    surfaceCave: property.characteristics?.surfaceCave,
    energyClass: overrides?.energyClass || property.energy?.energyClass,
    energyValue: overrides?.energyValue || property.energy?.energyValue,
    gesClass: overrides?.gesClass || property.energy?.gesClass,
    gesValue: overrides?.gesValue || property.energy?.gesValue,
    annualEnergyCostMin: property.energy?.annualEnergyCostMin,
    annualEnergyCostMax: property.energy?.annualEnergyCostMax,
    // Repli sur la date du DPE, comme le fait déjà le site public.
    energyPriceReferenceDate:
      property.energy?.dateReferenceEnergie ?? property.energy?.dpeDate,
    dpeImageUrl:
      overrides?.dpeImageUrl !== undefined
        ? overrides.dpeImageUrl
        : dpeImageUrlFromDocs,
    gesImageUrl:
      overrides?.gesImageUrl !== undefined
        ? overrides.gesImageUrl
        : gesImageUrlFromDocs,
    hasBalcony: property.amenities?.hasBalcony,
    hasTerrace: property.amenities?.hasTerrace,
    hasGarden: property.amenities?.hasGarden,
    hasParking: property.amenities?.hasParking,
    hasGarage: property.amenities?.hasGarage,
    hasCellar: property.amenities?.hasCellar,
    hasElevator: property.amenities?.hasElevator,
    hasPool: property.amenities?.hasPool,
    honoraires: property.finance?.honoraires,
    honorairesType: property.finance?.honorairesType,
    honorairesPct: property.finance?.honorairesPct,
    isInCopro: property.copro?.isInCopro,
    coprLots: property.copro?.coprLots,
    coprCharges: property.copro?.coprCharges,
    isExclusive: property.isExclusive,
  };
}

// Step indicator component
function StepIndicator({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: { title: string; icon: React.ReactNode }[];
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
            {index < currentStep ? <Check className="h-4 w-4" /> : step.icon}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-12 h-0.5 mx-1 transition-all duration-300 ${
                index < currentStep ? "bg-green-500" : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function LabelGenerationWizard({
  property,
  isOpen,
  onClose,
  onComplete,
  defaultColor = DEFAULT_COLOR,
}: LabelGenerationWizardProps) {
  const { toast } = useToast();
  const labelRef = useRef<HTMLDivElement>(null);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadSucceeded, setUploadSucceeded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Photo selection (up to 4 photos in order: main + 3 small)
  const [selectedPhotos, setSelectedPhotos] = useState<PropertyImage[]>([]);

  // Label customization
  const [primaryColor, setPrimaryColor] = useState(defaultColor);

  // Updated property for preview
  const [previewProperty, setPreviewProperty] = useState<Property>(property);

  const steps = [
    { title: "Sélection photos", icon: <ImageIcon className="h-4 w-4" /> },
    { title: "Personnalisation", icon: <Palette className="h-4 w-4" /> },
    { title: "Génération", icon: <FileText className="h-4 w-4" /> },
  ];

  // Reset state when property changes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setUploadSucceeded(false);
      // Pre-select main image if available, otherwise take first images
      const initialPhotos = property.images
        .slice()
        .sort(
          (a, b) =>
            (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0) || a.order - b.order,
        )
        .slice(0, 4);
      setSelectedPhotos(initialPhotos);
      setPrimaryColor(defaultColor);
      setPreviewProperty(property);
    }
  }, [isOpen, property, defaultColor]);

  // Generate PDF
  const generatePDF = async () => {
    setIsLoading(true);
    setLoadingMessage("Préparation de l'étiquette...");

    try {
      // First call the generate API to update property data
      setLoadingMessage("Mise à jour des données...");
      const response = await fetch("/api/labels/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          selectedPhotoIds: selectedPhotos.map((p) => p.id),
          primaryColor,
          // Volontairement pas de previewDpeUrl / previewGesUrl ici : passer les
          // URLs des documents existants ferait réutiliser les étiquettes déjà
          // stockées, donc l'ancien rendu. Sans elles, l'API régénère les SVG
          // avec le modèle courant avant de composer l'étiquette vitrine.
          energyValue: property.energy?.energyValue,
          energyClass: property.energy?.energyClass,
          gesValue: property.energy?.gesValue,
          gesClass: property.energy?.gesClass,
          finalEnergyValue: property.energy?.finalEnergyValue ?? null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la génération");
      }

      const data = await response.json();
      const updatedProperty = data.property as Property;

      // Update preview property with new data
      setPreviewProperty(updatedProperty);

      // Attendre que React ait rendu ET que les images soient chargées :
      // html2canvas laisserait sinon des cases blanches dans le PDF.
      setLoadingMessage("Rendu de l'étiquette...");
      await waitForImages(labelRef.current);

      // Generate PDF from canvas
      if (labelRef.current) {
        setLoadingMessage("Génération du PDF...");
        const canvas = await html2canvas(labelRef.current, {
          // Résolution inchangée : l'étiquette est imprimée et affichée en
          // vitrine, la netteté doit rester celle d'aujourd'hui. L'allègement
          // vient du format JPEG ci-dessous, pas d'une baisse de résolution.
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
        });

        // JPEG compressé plutôt que PNG : le PNG produisait des fichiers de
        // ~8,5 Mo, sous le plafond de body du middleware Next mais assez près
        // pour que l'upload échoue dès qu'une photo alourdissait le rendu.
        // Le fond blanc passé à html2canvas évite tout souci d'absence de
        // canal alpha en JPEG.
        const imgData = canvas.toDataURL("image/jpeg", 0.92);
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4",
          compress: true,
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = (pdfHeight - imgHeight * ratio) / 2;

        pdf.addImage(
          imgData,
          "JPEG",
          imgX,
          imgY,
          imgWidth * ratio,
          imgHeight * ratio,
          undefined,
          "FAST",
        );

        // Get PDF as blob
        const pdfBlob = pdf.output("blob");

        // Trace du poids réel : rend immédiatement visible toute dérive qui
        // rapprocherait à nouveau le PDF des plafonds d'upload.
        console.log(
          `PDF étiquette généré : ${(pdfBlob.size / 1024 / 1024).toFixed(2)} Mo`,
        );

        // Upload PDF to Supabase
        setLoadingMessage("Upload du PDF vers Supabase...");
        const formData = new FormData();
        formData.append("pdf", pdfBlob, `etiquette_${property.reference}.pdf`);
        formData.append("propertyId", property.id);

        const uploadResponse = await fetch("/api/labels/upload-pdf", {
          method: "POST",
          body: formData,
        });

        // L'échec d'enregistrement était auparavant réduit à une ligne de
        // console, puis masqué par un message de succès affirmant à tort que le
        // fichier était sauvegardé. L'agent repartait avec son PDF sans savoir
        // que rien n'avait été enregistré, et sans comprendre pourquoi la
        // mention « Étiquette générée » n'apparaissait jamais.
        const uploadOk = uploadResponse.ok;

        if (!uploadOk) {
          const errorData = await uploadResponse.json().catch(() => ({}));
          console.error("Failed to upload PDF label:", errorData);
        }

        // Le téléchargement local a lieu dans tous les cas : l'agent ne doit
        // pas perdre son fichier parce que l'enregistrement a échoué.
        pdf.save(`etiquette_${property.reference}.pdf`);

        setUploadSucceeded(uploadOk);

        if (uploadOk) {
          toast({
            title: "Étiquette générée avec succès",
            description: `Le fichier "etiquette_${property.reference}.pdf" a été téléchargé et sauvegardé dans votre espace.`,
          });
        } else {
          toast({
            title: "PDF généré mais non sauvegardé",
            description:
              "L'étiquette a été téléchargée sur votre poste, mais son enregistrement sur l'annonce a échoué. La mention « Étiquette générée » n'apparaîtra pas. Veuillez réessayer.",
            variant: "destructive",
          });
        }

        setCurrentStep(2);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Échec de la génération",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de générer le PDF. Vérifiez que les photos sont accessibles et réessayez.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handleClose = () => {
    if (currentStep === 2) {
      onComplete(uploadSucceeded);
    }
    onClose();
  };

  const goToCustomization = () => {
    // Update preview property with current values before going to customization step
    setPreviewProperty(property);
    setCurrentStep(1);
  };

  // Toggle photo selection
  const togglePhotoSelection = (image: PropertyImage) => {
    setSelectedPhotos((prev) => {
      const isSelected = prev.some((p) => p.id === image.id);
      if (isSelected) {
        // Remove from selection
        return prev.filter((p) => p.id !== image.id);
      } else if (prev.length < 4) {
        // Add to selection (max 4)
        return [...prev, image];
      }
      return prev;
    });
  };

  // Move photo in the order
  const movePhoto = (index: number, direction: "up" | "down") => {
    setSelectedPhotos((prev) => {
      const newArr = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newArr.length) return prev;
      [newArr[index], newArr[targetIndex]] = [
        newArr[targetIndex],
        newArr[index],
      ];
      return newArr;
    });
  };

  // Remove photo from selection
  const removePhoto = (index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Génération d&apos;étiquette - {property.reference}
          </DialogTitle>
          <DialogDescription>{steps[currentStep]?.title}</DialogDescription>
        </DialogHeader>

        <StepIndicator currentStep={currentStep} steps={steps} />

        {/* Step 0: Photo Selection */}
        {currentStep === 0 && (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <ImageIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Sélection des photos
              </h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Choisissez jusqu&apos;à 4 photos pour l&apos;étiquette. La
                première sera la photo principale, les 3 suivantes seront
                affichées en miniature.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Left: Available photos */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Photos disponibles</h4>
                {property.images.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-1">
                    {property.images.map((img) => {
                      const isSelected = selectedPhotos.some(
                        (p) => p.id === img.id,
                      );
                      const selectionIndex = selectedPhotos.findIndex(
                        (p) => p.id === img.id,
                      );
                      return (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => togglePhotoSelection(img)}
                          disabled={!isSelected && selectedPhotos.length >= 4}
                          className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${
                            isSelected
                              ? "border-primary ring-2 ring-primary/20"
                              : selectedPhotos.length >= 4
                                ? "border-transparent opacity-50 cursor-not-allowed"
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
                          {img.isMain && (
                            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-[10px] rounded">
                              Principale
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/30">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground text-center">
                      Aucune photo disponible
                    </p>
                    <p className="text-xs text-muted-foreground/70 text-center mt-1">
                      Ajoutez des photos à cette annonce pour les utiliser sur
                      l&apos;étiquette
                    </p>
                  </div>
                )}
              </div>

              {/* Right: Selected photos with order */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm flex items-center justify-between">
                  <span>Photos sélectionnées ({selectedPhotos.length}/4)</span>
                  {selectedPhotos.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPhotos([])}
                      className="text-xs h-7"
                    >
                      Tout effacer
                    </Button>
                  )}
                </h4>

                {selectedPhotos.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPhotos.map((photo, index) => (
                      <div
                        key={photo.id}
                        className={`flex items-center gap-3 p-2 rounded-lg border ${
                          index === 0
                            ? "bg-primary/5 border-primary/30"
                            : "bg-muted/50"
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

                        <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo.url}
                            alt={photo.alt || `Photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">
                            {index === 0
                              ? "📷 Photo principale"
                              : `Photo ${index + 1}`}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {index === 0
                              ? "Grande image à gauche de l'étiquette"
                              : "Miniature en bas de la colonne gauche"}
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
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted-foreground/30 rounded-lg">
                    <GripVertical className="h-8 w-8 text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground text-center">
                      Cliquez sur les photos pour les sélectionner
                    </p>
                  </div>
                )}

                {/* Preview layout hint */}
                {selectedPhotos.length > 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                      <strong>Disposition sur l&apos;étiquette :</strong>
                      <br />
                      • Photo 1 : Grande image principale (gauche)
                      <br />
                      {selectedPhotos.length > 1 &&
                        "• Photos 2-4 : Miniatures en dessous"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Customization */}
        {currentStep === 1 && (
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Left: Options */}
              <div className="space-y-6">
                {/* Photos summary */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Photos sélectionnées ({selectedPhotos.length})
                  </label>
                  {selectedPhotos.length > 0 ? (
                    <div className="flex gap-2">
                      {selectedPhotos.map((photo, index) => (
                        <div
                          key={photo.id}
                          className={`relative rounded-md overflow-hidden border-2 ${
                            index === 0
                              ? "w-20 h-20 border-primary"
                              : "w-12 h-12 border-muted"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo.url}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Aucune photo sélectionnée
                    </p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep(0)}
                  >
                    <Edit3 className="h-3 w-3 mr-2" />
                    Modifier la sélection
                  </Button>
                </div>

                {/* Color Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Couleur principale
                  </label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-32 font-mono text-sm"
                      placeholder="#306fb2"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPrimaryColor(DEFAULT_COLOR)}
                    >
                      Réinitialiser
                    </Button>
                  </div>
                  <div
                    className="h-8 rounded-md"
                    style={{ backgroundColor: primaryColor }}
                  />
                </div>

                {/* Summary */}
                <div className="p-4 bg-muted/50 rounded-lg text-sm">
                  <p className="font-medium mb-2">Récapitulatif :</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>
                      • DPE : {property.energy?.energyClass || "N/A"} (
                      {property.energy?.energyValue || 0} kWh/m²/an)
                    </li>
                    <li>
                      • GES : {property.energy?.gesClass || "N/A"} (
                      {property.energy?.gesValue || 0} kg CO₂/m²/an)
                    </li>
                    <li>
                      • Honoraires :{" "}
                      {property.finance?.honorairesType === "acquereur"
                        ? `À charge acquéreur (${property.finance?.honorairesPct}%)`
                        : "À charge vendeur"}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right: Preview */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Aperçu de l&apos;étiquette
                </label>
                <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                  <div
                    className="transform scale-[0.4] origin-top-left"
                    style={{ width: "250%", height: "252px" }}
                  >
                    <LabelPreview
                      property={toFlatLabelProperty(previewProperty)}
                      primaryColor={primaryColor}
                      selectedPhotos={selectedPhotos}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Hidden label for PDF generation */}
            <div className="fixed left-[-9999px] top-0">
              <LabelPreview
                ref={labelRef}
                property={toFlatLabelProperty(previewProperty)}
                primaryColor={primaryColor}
                selectedPhotos={selectedPhotos}
              />
            </div>

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-6 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">
                  {loadingMessage}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Complete */}
        {currentStep === 2 && (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-4">
                <Check className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Étiquette générée avec succès !
              </h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                L&apos;étiquette a été téléchargée et sauvegardée dans votre
                espace Supabase.
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span>DPE/GES stockées dans le bucket &quot;files&quot;</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span>PDF stocké dans le bucket &quot;labels&quot;</span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {currentStep === 0 && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button
                onClick={goToCustomization}
                disabled={
                  selectedPhotos.length === 0 && property.images.length > 0
                }
              >
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
              <Button onClick={generatePDF} disabled={isLoading}>
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

          {currentStep === 2 && (
            <Button onClick={handleClose}>
              <Check className="h-4 w-4 mr-2" />
              Terminer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
