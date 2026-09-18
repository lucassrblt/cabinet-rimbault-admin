/**
 * Échelle DPE / GES — source de vérité unique
 *
 * Ce module centralise TOUT ce qui définit l'échelle réglementaire française
 * (modèle 2021) : couleurs, seuils, bornes textuelles et la notion de
 * « passoire énergétique ».
 *
 * ⚠️ Aucun autre fichier ne doit redéclarer une palette DPE ou GES. Les
 * couleurs hexadécimales ci-dessous sont les couleurs officielles du modèle
 * 2021 et ne doivent pas être retouchées « pour faire plus joli » : le rendu
 * doit rester identique entre l'étiquette SVG, le PDF et la vitrine.
 *
 * Une copie de ce fichier existe dans la vitrine
 * (cabinet-rimbault-vitrine/src/lib/energy-scale.ts). Ce fichier-ci est la
 * source ; toute modification doit y être recopiée.
 */

export type EnergyClass = "A" | "B" | "C" | "D" | "E" | "F" | "G"

/** Les 7 classes, de la meilleure à la pire. */
export const ENERGY_CLASSES: readonly EnergyClass[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
]

/** Index de chaque classe dans l'échelle (A = 0 … G = 6). */
export const CLASS_INDEX: Record<EnergyClass, number> = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
  G: 6,
}

// ═══════════════════════════════════════════════════════════════════════════
// COULEURS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Palette DPE (vert → rouge) du nouveau modèle d'étiquette.
 *
 * Relevée au pixel sur la maquette de référence, puis reconvertie en sRGB
 * depuis le profil d'affichage de la capture. Elle remplace la palette
 * précédente, plus claire sur A→C.
 */
export const DPE_COLORS: Record<EnergyClass, string> = {
  A: "#088748",
  B: "#61ad2f",
  C: "#cbda0d",
  D: "#f7ee02",
  E: "#eba903",
  F: "#e38102",
  G: "#d74301",
}

/** Palette GES (bleu clair → violet foncé), relevée sur la même maquette. */
export const GES_COLORS: Record<EnergyClass, string> = {
  A: "#91d9fa",
  B: "#80bddd",
  C: "#71a0c2",
  D: "#587598",
  E: "#48597c",
  F: "#363b61",
  G: "#1f1138",
}

/**
 * Encre unique des étiquettes : titres, légendes, lettres et valeurs. La
 * maquette n'emploie qu'un seul gris très sombre, jamais du noir pur.
 */
export const LABEL_INK = "#323232"

/**
 * Couleur de texte lisible sur chaque fond DPE, pour les pastilles de classe.
 * Les jaunes et verts clairs (C, D, E) exigent un texte sombre.
 *
 * À ne pas confondre avec la mention « Passoire énergétique » portée dans les
 * barres F et G de l'étiquette, qui suit la maquette et reste blanche.
 */
export const DPE_TEXT_COLORS: Record<EnergyClass, string> = {
  A: "#ffffff",
  B: "#ffffff",
  C: LABEL_INK,
  D: LABEL_INK,
  E: LABEL_INK,
  F: LABEL_INK,
  G: "#ffffff",
}

/** Couleur de texte lisible sur chaque fond GES. */
export const GES_TEXT_COLORS: Record<EnergyClass, string> = {
  A: LABEL_INK,
  B: LABEL_INK,
  C: "#ffffff",
  D: "#ffffff",
  E: "#ffffff",
  F: "#ffffff",
  G: "#ffffff",
}

/** Variante Tailwind (fond + texte) pour le web, dérivée des mêmes hex. */
export const DPE_TAILWIND: Record<EnergyClass, string> = {
  A: "bg-[#088748] text-white",
  B: "bg-[#61ad2f] text-white",
  C: "bg-[#cbda0d] text-[#323232]",
  D: "bg-[#f7ee02] text-[#323232]",
  E: "bg-[#eba903] text-[#323232]",
  F: "bg-[#e38102] text-[#323232]",
  G: "bg-[#d74301] text-white",
}

/** Variante Tailwind GES — bleu → violet, jamais la palette DPE. */
export const GES_TAILWIND: Record<EnergyClass, string> = {
  A: "bg-[#91d9fa] text-[#323232]",
  B: "bg-[#80bddd] text-[#323232]",
  C: "bg-[#71a0c2] text-white",
  D: "bg-[#587598] text-white",
  E: "bg-[#48597c] text-white",
  F: "bg-[#363b61] text-white",
  G: "bg-[#1f1138] text-white",
}

// ═══════════════════════════════════════════════════════════════════════════
// SEUILS (modèle 2021)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Borne haute incluse de chaque classe DPE, en kWh/m²/an (énergie primaire).
 * G n'a pas de borne haute.
 */
export const DPE_THRESHOLDS: Record<EnergyClass, number> = {
  A: 70,
  B: 110,
  C: 180,
  D: 250,
  E: 330,
  F: 420,
  G: Number.POSITIVE_INFINITY,
}

/** Borne haute incluse de chaque classe GES, en kg CO₂/m²/an. */
export const GES_THRESHOLDS: Record<EnergyClass, number> = {
  A: 6,
  B: 11,
  C: 30,
  D: 50,
  E: 70,
  F: 100,
  G: Number.POSITIVE_INFINITY,
}

/** Bornes textuelles DPE, pour les libellés d'étiquette et de légende. */
export const DPE_BOUNDS_LABEL: Record<EnergyClass, string> = {
  A: "≤ 70",
  B: "71 à 110",
  C: "111 à 180",
  D: "181 à 250",
  E: "251 à 330",
  F: "331 à 420",
  G: "> 420",
}

/** Bornes textuelles GES. */
export const GES_BOUNDS_LABEL: Record<EnergyClass, string> = {
  A: "≤ 6",
  B: "7 à 11",
  C: "12 à 30",
  D: "31 à 50",
  E: "51 à 70",
  F: "71 à 100",
  G: "> 100",
}

/** Vrai si la chaîne est une classe A–G valide. */
export function isValidEnergyClass(value: string): value is EnergyClass {
  return (ENERGY_CLASSES as readonly string[]).includes(value.toUpperCase())
}

/**
 * Classe DPE correspondant à une consommation en kWh/m²/an.
 * Indicatif seulement : la classe qui fait foi est celle du rapport du
 * diagnostiqueur (double seuil énergie/GES), saisie à la main.
 */
export function getDpeClassFromValue(value: number): EnergyClass {
  return ENERGY_CLASSES.find((c) => value <= DPE_THRESHOLDS[c]) ?? "G"
}

/**
 * Classe GES correspondant à des émissions en kg CO₂/m²/an.
 * Même réserve que ci-dessus : indicatif.
 */
export function getGesClassFromValue(value: number): EnergyClass {
  return ENERGY_CLASSES.find((c) => value <= GES_THRESHOLDS[c]) ?? "G"
}

/**
 * Une « passoire énergétique » est un logement classé F ou G — et uniquement
 * F ou G (art. L. 173-1-1 CCH / loi Climat & Résilience). E n'en fait pas
 * partie. Seule définition autorisée de la notion dans le code.
 */
export function isPassoireEnergetique(
  energyClass: string | null | undefined,
): boolean {
  return energyClass === "F" || energyClass === "G"
}

/** Les classes considérées comme passoires énergétiques. */
export const PASSOIRE_CLASSES: readonly EnergyClass[] = ["F", "G"]
