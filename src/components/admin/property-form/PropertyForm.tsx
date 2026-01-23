"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

// Local imports
import { propertyFormSchema } from "./schema";
import {
  FORM_STEPS,
  STEP_REQUIRED_FIELDS,
  DEFAULT_FORM_VALUES,
} from "./constants";
import { apiDataToFormData, formDataToApiData } from "./utils";
import type {
  PropertyFormProps,
  PropertyFormData,
  PropertyImageData,
} from "./types";
import { getDocumentUrls } from "./types";

// Step components
import { GeneralInfoStep } from "./steps/GeneralInfoStep";
import { DetailsStep } from "./steps/DetailsStep";
import { EnergyStep } from "./steps/EnergyStep";
import { ImagesStep } from "./steps/ImagesStep";

export function PropertyForm({
  mode,
  initialData,
  propertyId,
}: PropertyFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  // États principaux
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<PropertyImageData[]>(
    initialData?.images || [],
  );

  // État pour la navigation par étapes
  const [currentStep, setCurrentStep] = useState<number>(0);

  // État pour la génération des labels DPE/GES
  const [isGeneratingLabels, setIsGeneratingLabels] = useState(false);
  const [previewDpeUrl, setPreviewDpeUrl] = useState<string | null>(null);
  const [previewGesUrl, setPreviewGesUrl] = useState<string | null>(null);

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: initialData
      ? apiDataToFormData(initialData)
      : DEFAULT_FORM_VALUES,
  });

  // Mettre à jour le formulaire quand les données initiales changent
  useEffect(() => {
    if (initialData) {
      const formData = apiDataToFormData(initialData);
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined) {
          form.setValue(key as keyof PropertyFormData, value as never);
        }
      });
      // Mettre à jour les images existantes
      if (initialData.images) {
        setExistingImages(initialData.images);
      }
      // Initialiser les URLs DPE/GES pour la prévisualisation (depuis les documents)
      const docUrls = getDocumentUrls(initialData.documents);
      if (docUrls.dpeImageUrl) {
        setPreviewDpeUrl(docUrls.dpeImageUrl);
      }
      if (docUrls.gesImageUrl) {
        setPreviewGesUrl(docUrls.gesImageUrl);
      }
    }
  }, [initialData, form]);

  // Validation d'une étape spécifique
  const validateStep = async (stepIndex: number): Promise<boolean> => {
    const stepId = FORM_STEPS[stepIndex].id;
    const requiredFields = STEP_REQUIRED_FIELDS[stepId];

    if (requiredFields.length === 0) {
      return true;
    }

    const result = await form.trigger(requiredFields);
    return result;
  };

  // Validation de toutes les étapes jusqu'à une étape cible
  const validateStepsUpTo = async (targetStep: number): Promise<boolean> => {
    for (let i = currentStep; i < targetStep; i++) {
      const isValid = await validateStep(i);
      if (!isValid) {
        setCurrentStep(i);
        return false;
      }
    }
    return true;
  };

  // Navigation vers une étape spécifique (depuis les indicateurs)
  const handleStepClick = async (targetStep: number) => {
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      return;
    }

    if (targetStep > currentStep) {
      const isValid = await validateStepsUpTo(targetStep);

      if (!isValid) {
        toast({
          title: "Champs manquants",
          description:
            "Veuillez remplir tous les champs obligatoires avant de continuer.",
          variant: "destructive",
        });
        return;
      }

      setCurrentStep(targetStep);
    }
  };

  // Générer les labels DPE/GES
  const generateEnergyLabels = async () => {
    const energyClass = form.getValues("energyClass");
    const energyValue = form.getValues("energyValue");
    const gesClass = form.getValues("gesClass");
    const gesValue = form.getValues("gesValue");
    const reference = form.getValues("reference");

    if (energyClass === "VIERGE" || gesClass === "VIERGE") {
      toast({
        title: "Classe invalide",
        description:
          "Les classes DPE et GES ne peuvent pas être 'Vierge' pour générer les labels.",
        variant: "destructive",
      });
      return false;
    }

    setIsGeneratingLabels(true);
    try {
      const response = await fetch("/api/labels/generate-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference,
          energyValue,
          energyClass,
          gesValue,
          gesClass,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Erreur lors de la génération des labels",
        );
      }

      if (result.success && result.preview) {
        form.setValue("dpeImageUrl", result.preview.dpeImageUrl);
        form.setValue("gesImageUrl", result.preview.gesImageUrl);
        setPreviewDpeUrl(result.preview.dpeImageUrl);
        setPreviewGesUrl(result.preview.gesImageUrl);

        toast({
          title: "Labels générés",
          description:
            "Les étiquettes DPE et GES ont été générées avec succès.",
        });
        return true;
      }
    } catch (error) {
      console.error("Erreur lors de la génération des labels:", error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Erreur lors de la génération des labels. Veuillez réessayer.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsGeneratingLabels(false);
    }
    return false;
  };

  const handleNextStep = async () => {
    const isValid = await validateStep(currentStep);

    if (!isValid) {
      toast({
        title: "Champs manquants",
        description:
          "Veuillez remplir tous les champs obligatoires avant de continuer.",
        variant: "destructive",
      });
      return;
    }

    // Si on est sur l'étape DPE (step 2), générer automatiquement les étiquettes
    if (currentStep === 2) {
      const success = await generateEnergyLabels();
      if (!success) {
        return;
      }
    }

    if (currentStep < FORM_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isLastStep = currentStep === FORM_STEPS.length - 1;

  // Fonction pour uploader les images
  async function uploadImages(targetPropertyId: string, files: File[]) {
    if (files.length > 20) {
      throw new Error(`Trop d'images à la fois. Maximum 20 images par upload.`);
    }

    let propertyReference: string;

    if (mode === "edit" && initialData) {
      propertyReference = initialData.reference;
    } else {
      propertyReference = form.getValues("reference");
      if (!propertyReference) {
        throw new Error(
          "La référence de la propriété est requise pour uploader des images",
        );
      }
    }

    const { uploadMultipleImages } = await import("@/lib/image-upload");

    const { uploaded, failed } = await uploadMultipleImages(
      files,
      propertyReference,
      (uploadedCount, total) => {
        console.log(`📤 Upload: ${uploadedCount}/${total} images uploadées`);
      },
    );

    if (uploaded.length === 0 && failed.length > 0) {
      const errorDetails = failed
        .map((e) => `- ${e.filename}: ${e.error}`)
        .join("\n");
      throw new Error(
        `Aucune image n'a pu être uploadée.\n\nDétails:\n${errorDetails}`,
      );
    }

    if (failed.length > 0) {
      const errorDetails = failed
        .map((e) => `- ${e.filename}: ${e.error}`)
        .join("\n");
      console.warn(
        `⚠️ ${failed.length} image(s) n'ont pas pu être uploadées:\n${errorDetails}`,
      );
    }

    const response = await fetch(`/api/properties/${targetPropertyId}/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        images: uploaded.map((img) => ({
          url: img.url,
          filename: img.filename,
          size: img.size,
          alt: img.filename.replace(/\.[^/.]+$/, ""),
        })),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || "Erreur lors de la création des entrées d'images",
      );
    }

    if (failed.length > 0) {
      result.warning = `${failed.length} image(s) n'ont pas pu être uploadées`;
      result.failed = failed.length;
    }

    return result;
  }

  // Supprimer une image existante
  const deleteExistingImage = useCallback(
    async (imageId: string) => {
      if (!propertyId) return;

      try {
        const response = await fetch(
          `/api/properties/${propertyId}/images?imageId=${imageId}`,
          { method: "DELETE" },
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression");
        }

        setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
        toast({
          title: "Image supprimée",
          description: "L'image a été supprimée avec succès.",
        });
      } catch (error) {
        console.error("Error deleting image:", error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'image.",
          variant: "destructive",
        });
      }
    },
    [propertyId, toast],
  );

  // Définir une image comme principale
  const setMainImage = useCallback(
    async (imageId: string) => {
      if (!propertyId) return;

      try {
        const response = await fetch(`/api/properties/${propertyId}/images`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageId, isMain: true }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la mise à jour");
        }

        setExistingImages((prev) =>
          prev.map((img) => ({
            ...img,
            isMain: img.id === imageId,
          })),
        );
        toast({
          title: "Image principale définie",
          description: "L'image a été définie comme image principale.",
        });
      } catch (error) {
        console.error("Error setting main image:", error);
        toast({
          title: "Erreur",
          description: "Impossible de définir l'image principale.",
          variant: "destructive",
        });
      }
    },
    [propertyId, toast],
  );

  // Soumission du formulaire
  async function onSubmit(data: PropertyFormData) {
    if (
      currentStep === FORM_STEPS.length - 1 &&
      existingImages.length === 0 &&
      newImages.length === 0
    ) {
      const confirmed = window.confirm(
        "Aucune image n'a été sélectionnée. Voulez-vous vraiment enregistrer l'annonce sans images ?",
      );
      if (!confirmed) {
        return;
      }
    }

    setIsLoading(true);
    try {
      const apiData = formDataToApiData(data);

      const url =
        mode === "edit" ? `/api/properties/${propertyId}` : "/api/properties";
      const method = mode === "edit" ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Une erreur est survenue");
      }

      // Note: Les labels DPE et GES sont maintenant générés automatiquement côté serveur
      // dans les routes POST /api/properties et PUT /api/properties/[id]

      const targetPropertyId = mode === "edit" ? propertyId : result.id;

      // Upload des nouvelles images
      if (newImages.length > 0 && targetPropertyId) {
        setIsUploadingImages(true);
        try {
          const uploadResult = await uploadImages(targetPropertyId, newImages);

          if (uploadResult.images && uploadResult.images.length > 0) {
            setExistingImages((prev) => [...prev, ...uploadResult.images]);
            setNewImages([]);
          }

          if (uploadResult.warning) {
            toast({
              title: "Upload partiel",
              description: uploadResult.warning,
              variant: "destructive",
            });
          } else if (uploadResult.uploaded > 0) {
            toast({
              title: "Images uploadées",
              description: `${uploadResult.uploaded} image(s) uploadée(s) avec succès.`,
            });
          }
        } catch (uploadError) {
          console.error("Error uploading images:", uploadError);
          const errorMessage =
            uploadError instanceof Error
              ? uploadError.message
              : "Erreur lors de l'upload des images";

          toast({
            title: "Échec de l'upload",
            description: errorMessage,
            variant: "destructive",
          });
          return;
        } finally {
          setIsUploadingImages(false);
        }
      }

      toast({
        title: mode === "edit" ? "Modifications enregistrées" : "Annonce créée",
        description:
          mode === "edit"
            ? `Les modifications de "${data.title}" ont été enregistrées avec succès.`
            : `L'annonce "${data.reference}" a été créée avec succès.`,
      });

      router.push("/properties");
      router.refresh();
    } catch (error) {
      console.error("Error submitting property:", error);
      toast({
        title:
          mode === "edit" ? "Échec de la modification" : "Échec de la création",
        description:
          error instanceof Error
            ? error.message
            : "Impossible d'enregistrer l'annonce. Vérifiez les données saisies et réessayez.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Rendu des étapes
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <GeneralInfoStep
            form={form}
            initialAddress={initialData?.location?.address}
          />
        );
      case 1:
        return <DetailsStep form={form} />;
      case 2:
        return (
          <EnergyStep
            form={form}
            mode={mode}
            initialData={initialData}
            previewDpeUrl={previewDpeUrl}
            previewGesUrl={previewGesUrl}
            setPreviewDpeUrl={setPreviewDpeUrl}
            setPreviewGesUrl={setPreviewGesUrl}
            isGeneratingLabels={isGeneratingLabels}
            setIsGeneratingLabels={setIsGeneratingLabels}
          />
        );
      case 3:
        return (
          <ImagesStep
            form={form}
            existingImages={existingImages}
            newImages={newImages}
            setNewImages={setNewImages}
            onDeleteImage={deleteExistingImage}
            onSetMainImage={setMainImage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/properties">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {mode === "edit" ? "Modifier l'annonce" : "Nouvelle annonce"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "edit"
              ? "Modifiez les informations de l'annonce"
              : "Créez une nouvelle annonce immobilière"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Indicateur d'étapes */}
          <div className="bg-secondary/95 p-1 rounded-lg">
            <div className="flex">
              {FORM_STEPS.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => handleStepClick(index)}
                  className={`
                    flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200
                    ${
                      index === currentStep
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

          {/* Contenu de l'étape courante */}
          <div className="space-y-6">{renderStep()}</div>

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

              {isLastStep ? (
                <Button
                  type="submit"
                  disabled={isLoading || isUploadingImages}
                  className="shadow-sm"
                >
                  {isLoading || isUploadingImages ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isUploadingImages
                        ? "Upload des images..."
                        : "Enregistrement..."}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {mode === "edit"
                        ? "Enregistrer les modifications"
                        : "Enregistrer"}
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  disabled={isGeneratingLabels}
                  className="shadow-sm"
                >
                  {isGeneratingLabels ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Génération des étiquettes...
                    </>
                  ) : (
                    <>
                      Suivant
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
