"use client"

import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { Loader2, RefreshCw, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import type { PropertyFormData, PropertyApiData } from "../types"
import { getDocumentUrls } from "../types"

interface EnergyLabelsPreviewProps {
  form: UseFormReturn<PropertyFormData>
  mode: "create" | "edit"
  initialData?: PropertyApiData
  previewDpeUrl: string | null
  previewGesUrl: string | null
  setPreviewDpeUrl: (url: string | null) => void
  setPreviewGesUrl: (url: string | null) => void
  isGeneratingLabels: boolean
  setIsGeneratingLabels: (loading: boolean) => void
}

export function EnergyLabelsPreview({
  form,
  mode,
  initialData,
  previewDpeUrl,
  previewGesUrl,
  setPreviewDpeUrl,
  setPreviewGesUrl,
  isGeneratingLabels,
  setIsGeneratingLabels,
}: EnergyLabelsPreviewProps) {
  const { toast } = useToast()
  const [hasChanges, setHasChanges] = useState(false)

  // URLs actuelles (depuis les documents)
  const docUrls = getDocumentUrls(initialData?.documents)
  const currentDpeUrl = docUrls.dpeImageUrl
  const currentGesUrl = docUrls.gesImageUrl
  
  // Valeurs initiales pour comparaison
  const initialEnergyClass = initialData?.energy?.energyClass
  const initialEnergyValue = initialData?.energy?.energyValue
  const initialFinalEnergyValue = initialData?.energy?.finalEnergyValue
  const initialGesClass = initialData?.energy?.gesClass
  const initialGesValue = initialData?.energy?.gesValue

  // Valeurs actuelles du formulaire
  const currentFormEnergyClass = form.watch("energyClass")
  const currentFormEnergyValue = form.watch("energyValue")
  const currentFormFinalEnergyValue = form.watch("finalEnergyValue")
  const currentFormGesClass = form.watch("gesClass")
  const currentFormGesValue = form.watch("gesValue")

  // Vérifier si les valeurs ont changé
  const valuesChanged = mode === "edit" && (
    currentFormEnergyClass !== initialEnergyClass ||
    currentFormEnergyValue !== initialEnergyValue ||
    currentFormFinalEnergyValue !== initialFinalEnergyValue ||
    currentFormGesClass !== initialGesClass ||
    currentFormGesValue !== initialGesValue
  )

  const handleGenerateLabels = async () => {
    const energyClass = form.getValues("energyClass")
    const energyValue = form.getValues("energyValue")
    const finalEnergyValue = form.getValues("finalEnergyValue")
    const gesClass = form.getValues("gesClass")
    const gesValue = form.getValues("gesValue")

    // Validation des données
    if (!energyClass || !energyValue || !gesClass || !gesValue) {
      toast({
        title: "Données manquantes",
        description: "Veuillez remplir tous les champs DPE et GES avant de générer les labels.",
        variant: "destructive",
      })
      return
    }

    if (energyClass === "VIERGE" || gesClass === "VIERGE") {
      toast({
        title: "Classe invalide",
        description: "Les classes DPE et GES ne peuvent pas être 'Vierge' pour générer les labels.",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingLabels(true)
    try {
      const response = await fetch("/api/labels/preview-energy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          energyValue,
          energyClass,
          gesValue,
          gesClass,
          finalEnergyValue,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la génération des labels")
      }

      if (result.success && result.preview) {
        // Mettre à jour les URLs dans le formulaire
        form.setValue("dpeImageUrl", result.preview.dpeImageUrl)
        form.setValue("gesImageUrl", result.preview.gesImageUrl)
        
        // Afficher la prévisualisation
        setPreviewDpeUrl(result.preview.dpeImageUrl)
        setPreviewGesUrl(result.preview.gesImageUrl)
        setHasChanges(true)

        toast({
          title: "Labels générés",
          description: "Les étiquettes DPE et GES ont été générées avec succès.",
        })
      }
    } catch (error) {
      console.error("Erreur lors de la génération des labels:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la génération des labels",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingLabels(false)
    }
  }

  const showCurrentLabels = mode === "edit" && (currentDpeUrl || currentGesUrl) && !hasChanges
  const showPreviewLabels = previewDpeUrl || previewGesUrl || form.watch("dpeImageUrl") || form.watch("gesImageUrl")

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">
          {mode === "edit" ? "Étiquettes DPE/GES" : "Prévisualisation des étiquettes DPE/GES"}
        </CardTitle>
        <CardDescription>
          {mode === "edit" 
            ? "Les étiquettes actuelles et la possibilité de les régénérer"
            : "Les étiquettes seront générées automatiquement lors du clic sur \"Suivant\""
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Alerte si les valeurs ont changé */}
        {valuesChanged && (
          <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Les valeurs DPE/GES ont été modifiées
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500">
                Pensez à régénérer les étiquettes pour refléter les nouvelles valeurs.
              </p>
            </div>
          </div>
        )}

        {/* Étiquettes actuelles (mode édition) */}
        {showCurrentLabels && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Étiquettes actuelles
            </div>
            <div className="flex flex-wrap gap-6 justify-center items-end p-4 bg-muted/50 rounded-lg border border-border">
              {currentDpeUrl && (
                <div className="w-full max-w-sm text-center">
                  <div className="text-xs text-muted-foreground mb-2 uppercase font-semibold">
                    DPE - Classe {initialEnergyClass} ({initialEnergyValue} kWh/m²/an)
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentDpeUrl}
                    alt="Étiquette DPE actuelle"
                    className="h-auto w-full object-contain"
                  />
                </div>
              )}
              {currentGesUrl && (
                <div className="w-full max-w-sm text-center">
                  <div className="text-xs text-muted-foreground mb-2 uppercase font-semibold">
                    GES - Classe {initialGesClass} ({initialGesValue} kg CO₂/m²/an)
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentGesUrl}
                    alt="Étiquette GES actuelle"
                    className="h-auto w-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bouton de génération */}
        <div className="flex gap-4">
          <Button
            type="button"
            onClick={handleGenerateLabels}
            disabled={isGeneratingLabels}
            variant={mode === "edit" && valuesChanged ? "default" : "outline"}
            className="flex-1"
          >
            {isGeneratingLabels ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                {mode === "edit" 
                  ? (valuesChanged ? "Régénérer les étiquettes" : "Régénérer les étiquettes") 
                  : "Prévisualiser les étiquettes"
                }
              </>
            )}
          </Button>
        </div>

        {/* Prévisualisation des nouvelles étiquettes */}
        {showPreviewLabels && hasChanges && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <RefreshCw className="h-4 w-4 text-primary" />
              {mode === "edit" ? "Nouvelles étiquettes (non enregistrées)" : "Prévisualisation"}
            </div>
            <div className="flex flex-wrap gap-6 justify-center items-end p-4 bg-primary/5 rounded-lg border border-primary/20">
              {(previewDpeUrl || form.watch("dpeImageUrl")) && (
                <div className="w-full max-w-sm text-center">
                  <div className="text-xs text-muted-foreground mb-2 uppercase font-semibold">
                    DPE - Classe {currentFormEnergyClass} ({currentFormEnergyValue} kWh/m²/an)
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewDpeUrl || form.watch("dpeImageUrl") || ""}
                    alt="Nouvelle étiquette DPE"
                    className="h-auto w-full object-contain"
                  />
                </div>
              )}
              {(previewGesUrl || form.watch("gesImageUrl")) && (
                <div className="w-full max-w-sm text-center">
                  <div className="text-xs text-muted-foreground mb-2 uppercase font-semibold">
                    GES - Classe {currentFormGesClass} ({currentFormGesValue} kg CO₂/m²/an)
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewGesUrl || form.watch("gesImageUrl") || ""}
                    alt="Nouvelle étiquette GES"
                    className="h-auto w-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Prévisualisation simple en mode création */}
        {showPreviewLabels && !hasChanges && mode === "create" && (
          <div className="space-y-4">
            <div className="text-sm font-medium text-foreground">Prévisualisation des étiquettes</div>
            <div className="flex flex-wrap gap-6 justify-center items-end p-4 bg-muted/50 rounded-lg">
              {(previewDpeUrl || form.watch("dpeImageUrl")) && (
                <div className="w-full max-w-sm text-center">
                  <div className="text-xs text-muted-foreground mb-2 uppercase font-semibold">
                    DPE
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewDpeUrl || form.watch("dpeImageUrl") || ""}
                    alt="Étiquette DPE"
                    className="h-auto w-full object-contain"
                  />
                </div>
              )}
              {(previewGesUrl || form.watch("gesImageUrl")) && (
                <div className="w-full max-w-sm text-center">
                  <div className="text-xs text-muted-foreground mb-2 uppercase font-semibold">
                    GES
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewGesUrl || form.watch("gesImageUrl") || ""}
                    alt="Étiquette GES"
                    className="h-auto w-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

