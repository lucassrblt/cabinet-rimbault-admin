/**
 * Aperçu des étiquettes DPE/GES.
 *
 * Génère les deux SVG localement et les renvoie en data URLs, sans aucun
 * upload dans Supabase Storage. Le stockage n'a lieu qu'à la soumission du
 * formulaire, via `autoGenerateEnergyLabels`.
 *
 * Partagé par la route d'aperçu et ses appelants pour éviter la double
 * implémentation qui existait entre `generate-preview` et `preview-energy`.
 */

import { generateDpeSvg } from "./generate-dpe"
import { generateGesSvg } from "./generate-ges"
import { ENERGY_CLASSES, isValidEnergyClass, type EnergyClass } from "./scale"

export interface EnergyPreviewInput {
  energyValue?: number | null
  energyClass?: string | null
  gesValue?: number | null
  gesClass?: string | null
  /** Énergie finale : facultative, la ligne est omise de l'étiquette si absente. */
  finalEnergyValue?: number | null
}

export interface EnergyPreview {
  dpeImageUrl: string
  gesImageUrl: string
  energyValue: number
  energyClass: EnergyClass
  gesValue: number
  gesClass: EnergyClass
  finalEnergyValue: number | null
}

export type EnergyPreviewResult =
  | { success: true; preview: EnergyPreview }
  | { success: false; error: string }

const ACCEPTED_CLASSES = ENERGY_CLASSES.join(", ")

function toDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg, "utf-8").toString("base64")}`
}

/**
 * Valide les données énergétiques puis produit les deux étiquettes en data URL.
 * Ne touche ni la base ni le storage.
 */
export function buildEnergyPreview(
  input: EnergyPreviewInput,
): EnergyPreviewResult {
  const { energyValue, energyClass, gesValue, gesClass, finalEnergyValue } =
    input

  if (!energyClass || !energyValue) {
    return {
      success: false,
      error: "Les données DPE (classe et valeur) sont requises",
    }
  }

  if (!gesClass || !gesValue) {
    return {
      success: false,
      error: "Les données GES (classe et valeur) sont requises",
    }
  }

  const normalizedEnergyClass = energyClass.toUpperCase()
  const normalizedGesClass = gesClass.toUpperCase()

  if (!isValidEnergyClass(normalizedEnergyClass)) {
    return {
      success: false,
      error: `Classe DPE invalide: ${energyClass}. Valeurs acceptées: ${ACCEPTED_CLASSES}`,
    }
  }

  if (!isValidEnergyClass(normalizedGesClass)) {
    return {
      success: false,
      error: `Classe GES invalide: ${gesClass}. Valeurs acceptées: ${ACCEPTED_CLASSES}`,
    }
  }

  const dpeSvg = generateDpeSvg(
    energyValue,
    normalizedEnergyClass,
    gesValue,
    finalEnergyValue,
  )
  const gesSvg = generateGesSvg(gesValue, normalizedGesClass)

  return {
    success: true,
    preview: {
      dpeImageUrl: toDataUrl(dpeSvg),
      gesImageUrl: toDataUrl(gesSvg),
      energyValue,
      energyClass: normalizedEnergyClass,
      gesValue,
      gesClass: normalizedGesClass,
      finalEnergyValue: finalEnergyValue ?? null,
    },
  }
}
