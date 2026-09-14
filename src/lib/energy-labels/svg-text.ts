/**
 * Petits utilitaires de métrique et de mise en forme texte pour les étiquettes
 * SVG.
 *
 * Les étiquettes sont générées côté serveur sans moteur de rendu : impossible
 * de mesurer réellement un texte. On approxime donc l'avance moyenne des
 * caractères d'une sans-serif (Arial/Helvetica), ce qui suffit largement pour
 * découper un libellé en lignes et pour détecter un débordement de cellule.
 */

/** Avance moyenne d'un caractère, en em, selon la graisse. */
const EM_WIDTH_REGULAR = 0.52
const EM_WIDTH_BOLD = 0.56

/** Caractères nettement plus étroits que la moyenne. */
const NARROW_CHARS = new Set([
  " ",
  ".",
  ",",
  ":",
  ";",
  "'",
  "’",
  "(",
  ")",
  "*",
  "/",
  "|",
  "i",
  "l",
  "j",
  "t",
  "f",
  "r",
  "²",
  "₂",
])
const EM_WIDTH_NARROW_RATIO = 0.62

export type FontWeight = "regular" | "bold"

/** Largeur approximative d'un texte, en em. */
export function textWidthEm(text: string, weight: FontWeight = "bold"): number {
  const base = weight === "bold" ? EM_WIDTH_BOLD : EM_WIDTH_REGULAR
  return [...text].reduce(
    (sum, char) =>
      sum + (NARROW_CHARS.has(char) ? base * EM_WIDTH_NARROW_RATIO : base),
    0,
  )
}

/** Largeur approximative d'un texte, en px, pour une taille de police donnée. */
export function textWidthPx(
  text: string,
  fontSize: number,
  weight: FontWeight = "bold",
): number {
  return textWidthEm(text, weight) * fontSize
}

/**
 * Renvoie la plus grande taille de police ≤ `nominal` qui fait tenir `text`
 * dans `maxWidth`, sans descendre sous `min`. Une consommation à 4 chiffres
 * (classe G, > 999 kWh/m²/an) est un cas réel qui déborderait sinon.
 */
export function fitFontSize(
  text: string,
  maxWidth: number,
  nominal: number,
  min: number,
  weight: FontWeight = "bold",
): number {
  const em = textWidthEm(text, weight)
  if (em === 0) return nominal
  if (em * nominal <= maxWidth) return nominal
  const fitted = Math.floor((maxWidth / em) * 10) / 10
  return Math.max(min, fitted)
}

/**
 * Découpe un libellé en lignes tenant dans `maxWidth`. Un mot plus large que
 * la ligne n'est pas coupé : il occupe sa ligne et débordera plutôt que de
 * devenir illisible — aucun libellé d'étiquette n'est dans ce cas.
 */
export function wrapText(
  text: string,
  maxWidth: number,
  fontSize: number,
  weight: FontWeight = "regular",
): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length === 0) return []

  const lines: string[] = []
  let current = words[0]

  for (const word of words.slice(1)) {
    const candidate = `${current} ${word}`
    if (textWidthPx(candidate, fontSize, weight) <= maxWidth) {
      current = candidate
    } else {
      lines.push(current)
      current = word
    }
  }
  lines.push(current)
  return lines
}

/**
 * Formate un entier à la française : espace fine insécable comme séparateur
 * de milliers, pour que « 1 250 kWh/m².an » ne se coupe jamais en fin de ligne.
 */
export function formatNumber(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
}

/** Échappe les caractères qui casseraient le XML du SVG. */
export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
