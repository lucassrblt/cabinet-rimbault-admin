"use client"

import { AlertCircle } from "lucide-react"

import {
  DPE_BOUNDS_LABEL,
  GES_BOUNDS_LABEL,
  getDpeClassFromValue,
  getGesClassFromValue,
  isValidEnergyClass,
  CLASS_INDEX,
  type EnergyClass,
} from "@/lib/energy-labels/scale"

interface EnergyConsistencyWarningProps {
  energyClass?: string | null
  energyValue?: number | null
  gesClass?: string | null
  gesValue?: number | null
}

/**
 * Avertissement non bloquant sur la cohérence de la saisie énergie.
 *
 * La classe qui fait foi est celle du rapport du diagnostiqueur : on ne
 * corrige donc JAMAIS automatiquement. On se contente de signaler un écart
 * entre la classe saisie et celle que la valeur suggère, et de rappeler la
 * règle du double seuil (la classe retenue est la plus mauvaise des deux).
 */
export function EnergyConsistencyWarning({
  energyClass,
  energyValue,
  gesClass,
  gesValue,
}: EnergyConsistencyWarningProps) {
  const messages: string[] = []

  const dpeClassIsSet =
    !!energyClass && energyClass !== "VIERGE" && isValidEnergyClass(energyClass)
  const gesClassIsSet =
    !!gesClass && gesClass !== "VIERGE" && isValidEnergyClass(gesClass)

  if (dpeClassIsSet && energyValue != null && energyValue > 0) {
    const expected = getDpeClassFromValue(energyValue)
    if (expected !== energyClass) {
      messages.push(
        `Consommation de ${energyValue} kWh/m²/an : les seuils 2021 situent cette valeur en classe ${expected} (${DPE_BOUNDS_LABEL[expected]}), pas ${energyClass}.`,
      )
    }
  }

  if (gesClassIsSet && gesValue != null && gesValue > 0) {
    const expected = getGesClassFromValue(gesValue)
    if (expected !== gesClass) {
      messages.push(
        `Émissions de ${gesValue} kg CO₂/m²/an : les seuils 2021 situent cette valeur en classe ${expected} (${GES_BOUNDS_LABEL[expected]}), pas ${gesClass}.`,
      )
    }
  }

  // Règle du double seuil : la classe énergétique retenue est la plus mauvaise
  // des deux (énergie / GES). Un DPE meilleur que le GES mérite un rappel.
  if (dpeClassIsSet && gesClassIsSet) {
    const dpeIndex = CLASS_INDEX[energyClass as EnergyClass]
    const gesIndex = CLASS_INDEX[gesClass as EnergyClass]
    if (dpeIndex < gesIndex) {
      messages.push(
        `Double seuil : la classe retenue est la plus mauvaise des deux. Avec un GES en ${gesClass}, la classe du logement est ${gesClass} et non ${energyClass} — vérifiez le rapport du diagnostiqueur.`,
      )
    }
  }

  if (messages.length === 0) return null

  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
          Cohérence de la saisie à vérifier
        </p>
        <ul className="list-disc space-y-1 pl-4 text-xs text-amber-600 dark:text-amber-500">
          {messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
        <p className="text-xs text-amber-600/80 dark:text-amber-500/80">
          Avertissement indicatif : la classe qui fait foi est celle du rapport
          du diagnostiqueur. Rien n&apos;est corrigé automatiquement.
        </p>
      </div>
    </div>
  )
}
