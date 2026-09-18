/**
 * Géométrie commune aux étiquettes DPE et GES (nouveau modèle : échelle
 * verticale à gauche, encadré de valeurs relié à la classe retenue).
 *
 * Toutes les mesures sont relevées au pixel sur les maquettes de référence,
 * dont les deux planches (DPE et GES) suivent rigoureusement le même gabarit.
 * Une unité SVG = un pixel de la maquette : les constantes ci-dessous se
 * relisent donc directement sur celle-ci.
 *
 * Les deux étiquettes ne diffèrent que par la forme des barres, la palette et
 * le contenu de l'encadré : tout le reste (titres, colonne des lettres, pile
 * de barres, ligne de rappel, encadré) vit ici pour qu'un ajustement visuel
 * n'ait jamais à être fait deux fois.
 *
 * Couleurs : voir `./scale`, source de vérité unique.
 */

import { CLASS_INDEX, ENERGY_CLASSES, LABEL_INK, type EnergyClass } from "./scale"
import { escapeXml, fitFontSize, wrapText } from "./svg-text"

// ═══════════════════════════════════════════════════════════════════════════
// TOILE
// ═══════════════════════════════════════════════════════════════════════════

export const CANVAS_WIDTH = 750
export const CANVAS_HEIGHT = 560

/** Marge gauche du texte : titre, légendes et lettres de classe. */
const PAD_X = 24

/** Largeur utile, du bord gauche du texte au bord droit de l'encadré. */
const CONTENT_WIDTH = 701

// ═══════════════════════════════════════════════════════════════════════════
// PILE DES BARRES
// ═══════════════════════════════════════════════════════════════════════════

export const BAR_HEIGHT = 48
export const ROW_GAP = 8
export const ROW_PITCH = BAR_HEIGHT + ROW_GAP
export const ROWS_TOP = 116
export const ROWS_BOTTOM = ROWS_TOP + 6 * ROW_PITCH + BAR_HEIGHT

/** Origine des barres, à 58 du bord gauche du texte. */
export const BAR_X = PAD_X + 58

/** Largeur totale d'une barre : croît d'un pas constant de A à G. */
const BAR_WIDTH_MIN = 126
const BAR_WIDTH_STEP = 24

/** Arrondi des deux coins gauches, commun aux flèches DPE et aux barres GES. */
const BAR_CORNER_RADIUS = 3

// ═══════════════════════════════════════════════════════════════════════════
// ENCADRÉ DE VALEURS
// ═══════════════════════════════════════════════════════════════════════════

export const CALLOUT_X = PAD_X + 366
export const CALLOUT_WIDTH = 335
const CALLOUT_PAD_X = 27
const CALLOUT_RADIUS = 12
const CALLOUT_BORDER = 2

/** Largeur de texte disponible dans l'encadré. */
const CALLOUT_TEXT_WIDTH = CALLOUT_WIDTH - 2 * CALLOUT_PAD_X

/** Rythme vertical de l'encadré, mesuré depuis son bord supérieur. */
const CALLOUT_LETTER_BASELINE = 64
const CALLOUT_FIRST_LABEL_BASELINE = 117
const CALLOUT_LINE_STEP = 32
/** Supplément avant l'intitulé d'un nouveau bloc. */
const CALLOUT_ENTRY_EXTRA = 16
/** Hauteur conservée sous la dernière valeur. */
const CALLOUT_BOTTOM_PAD = 50

/** Débord maximal de l'encadré sous la pile des barres. */
const CALLOUT_OVERHANG = 20

// ═══════════════════════════════════════════════════════════════════════════
// TYPOGRAPHIE
// ═══════════════════════════════════════════════════════════════════════════

const TITLE_SIZE = 26
const TITLE_SIZE_MIN = 18
const CAPTION_SIZE = 21
const LETTER_SIZE = 25
export const BAR_NOTE_SIZE = 21
const BAR_NOTE_SIZE_MIN = 14
const CALLOUT_LETTER_SIZE = 36
const CALLOUT_TEXT_SIZE = 21
const CALLOUT_VALUE_SIZE_MIN = 14

/** Rapport hauteur de capitale / corps, pour centrer une ligne sur une barre. */
const CAP_RATIO = 0.716

/** Lignes de base du titre et des deux légendes. */
const TITLE_BASELINE = 41
const TOP_CAPTION_BASELINE = TITLE_BASELINE + 58
const BOTTOM_CAPTION_BASELINE = ROWS_BOTTOM + 32

/**
 * La maquette emploie une sans-serif humaniste. Un SVG servi en `<img>` ne
 * dispose que des polices installées : on liste les plus proches avant de
 * retomber sur Arial, et toute ligne qui risque de déborder est rétrécie.
 */
const FONT_STACK = "Lato, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"

// ═══════════════════════════════════════════════════════════════════════════
// MESURES
// ═══════════════════════════════════════════════════════════════════════════

/** Largeur totale de la barre d'une classe, pointe ou bout arrondi compris. */
export function barWidth(letter: EnergyClass): number {
  return BAR_WIDTH_MIN + CLASS_INDEX[letter] * BAR_WIDTH_STEP
}

/** Bornes verticales de la rangée d'une classe. */
export function rowY(letter: EnergyClass): {
  top: number
  bottom: number
  center: number
} {
  const top = ROWS_TOP + CLASS_INDEX[letter] * ROW_PITCH
  return { top, bottom: top + BAR_HEIGHT, center: top + BAR_HEIGHT / 2 }
}

/** Ligne de base qui centre optiquement une capitale sur la rangée. */
function centeredBaseline(center: number, fontSize: number): number {
  return round(center + (fontSize * CAP_RATIO) / 2)
}

/** Arrondit au dixième : des coordonnées courtes, un SVG lisible. */
export function round(value: number): number {
  return Math.round(value * 10) / 10
}

/**
 * Tracé d'une barre : les deux familles partagent le bord gauche, à coins
 * légèrement arrondis, et ne diffèrent que par `rightSide` — la pointe de la
 * flèche DPE ou le bout arrondi de la barre GES. Ce segment part du haut de
 * la barre et doit se terminer sur son coin inférieur gauche.
 */
export function barPath(top: number, bottom: number, rightSide: string): string {
  const r = BAR_CORNER_RADIUS
  return `M${BAR_X + r},${top}${rightSide}A${r},${r} 0 0 1 ${BAR_X},${bottom - r}L${BAR_X},${top + r}A${r},${r} 0 0 1 ${BAR_X + r},${top}Z`
}

/** Abscisse à laquelle le bord gauche arrondi rejoint l'horizontale. */
export const BAR_LEFT_AFTER_RADIUS = BAR_X + BAR_CORNER_RADIUS

// ═══════════════════════════════════════════════════════════════════════════
// ENCADRÉ
// ═══════════════════════════════════════════════════════════════════════════

/** Une ligne de l'encadré : un intitulé et sa valeur chiffrée. */
export interface CalloutEntry {
  label: string
  value: string
}

/** Lignes de base de l'encadré, mesurées depuis son bord supérieur. */
function calloutBaselines(entries: CalloutEntry[]): {
  lines: { text: string; baseline: number; bold: boolean }[]
  height: number
} {
  const lines: { text: string; baseline: number; bold: boolean }[] = []
  let baseline = CALLOUT_FIRST_LABEL_BASELINE

  entries.forEach((entry, index) => {
    if (index > 0) baseline += CALLOUT_ENTRY_EXTRA
    for (const line of wrapText(entry.label, CALLOUT_TEXT_WIDTH, CALLOUT_TEXT_SIZE)) {
      lines.push({ text: line, baseline, bold: false })
      baseline += CALLOUT_LINE_STEP
    }
    lines.push({ text: entry.value, baseline, bold: true })
    baseline += CALLOUT_LINE_STEP
  })

  const last = lines[lines.length - 1]?.baseline ?? CALLOUT_LETTER_BASELINE
  return { lines, height: last + CALLOUT_BOTTOM_PAD }
}

/**
 * Ordonnée du haut de l'encadré.
 *
 * Il s'aligne sur le haut de la rangée retenue, et ne remonte que de ce qu'il
 * faut pour ne pas descendre sous la pile des barres — la règle que suivent
 * les deux maquettes.
 */
function calloutTop(rowTop: number, height: number): number {
  const maxBottom = ROWS_BOTTOM + CALLOUT_OVERHANG
  return Math.min(rowTop, maxBottom - height)
}

/**
 * Encadré relié à la classe retenue : ligne de rappel horizontale, cadre
 * arrondi teinté de la classe, grande lettre puis les valeurs chiffrées.
 */
export function renderCallout({
  letter,
  entries,
  barRight,
  accent,
}: {
  letter: EnergyClass
  entries: CalloutEntry[]
  barRight: number
  accent: string
}): string {
  const { top: rowTop, center } = rowY(letter)
  const { lines, height } = calloutBaselines(entries)
  const top = calloutTop(rowTop, height)
  const textX = CALLOUT_X + CALLOUT_PAD_X

  const texts = lines.map(({ text, baseline, bold }) => {
    if (!bold) {
      return `  <text class="callout-label" x="${textX}" y="${round(top + baseline)}">${escapeXml(text)}</text>`
    }
    const size = fitFontSize(
      text,
      CALLOUT_TEXT_WIDTH,
      CALLOUT_TEXT_SIZE,
      CALLOUT_VALUE_SIZE_MIN,
    )
    return `  <text class="callout-value" font-size="${size}px" x="${textX}" y="${round(top + baseline)}">${escapeXml(text)}</text>`
  })

  return `  <!-- Encadré de la classe ${letter} -->
  <line class="leader" x1="${round(barRight)}" x2="${CALLOUT_X}" y1="${round(center)}" y2="${round(center)}" stroke="${accent}"/>
  <rect x="${CALLOUT_X}" y="${round(top)}" width="${CALLOUT_WIDTH}" height="${round(height)}" rx="${CALLOUT_RADIUS}" fill="#ffffff" stroke="${accent}" stroke-width="${CALLOUT_BORDER}"/>
  <text class="callout-letter" x="${textX}" y="${round(top + CALLOUT_LETTER_BASELINE)}">${letter}</text>
${texts.join("\n")}`
}

// ═══════════════════════════════════════════════════════════════════════════
// RANGÉES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Rangée complète : la lettre de la classe, sa barre, et éventuellement une
 * mention portée à l'intérieur de la barre (« Passoire énergétique »).
 */
export function renderRow({
  letter,
  shape,
  color,
  note,
}: {
  letter: EnergyClass
  shape: string
  color: string
  note?: string
}): string {
  const { center } = rowY(letter)
  let noteMarkup = ""

  if (note) {
    // La mention tient dans le corps de la barre, jamais dans sa pointe.
    const size = fitFontSize(
      note,
      barWidth(letter) - 30,
      BAR_NOTE_SIZE,
      BAR_NOTE_SIZE_MIN,
    )
    noteMarkup = `\n  <text class="bar-note" font-size="${size}px" x="${BAR_X + 10}" y="${centeredBaseline(center, size)}">${escapeXml(note)}</text>`
  }

  return `  <!-- ${letter} -->
  <text class="row-letter" x="${PAD_X}" y="${centeredBaseline(center, LETTER_SIZE)}">${letter}</text>
  <path d="${shape}" fill="${color}"/>${noteMarkup}`
}

/** Toutes les rangées, de A à G. */
export function renderRows(render: (letter: EnergyClass) => string): string {
  return ENERGY_CLASSES.map(render).join("\n")
}

// ═══════════════════════════════════════════════════════════════════════════
// CHÂSSIS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Feuille de style commune.
 *
 * Aucune règle `fill` sur le sélecteur `text` : une déclaration CSS
 * l'emporterait sur l'attribut `fill` de la mention portée dans les barres.
 */
function styleBlock(): string {
  return `  <style>
    text {
      font-family: ${FONT_STACK};
    }
    .title { font-size: ${TITLE_SIZE}px; font-weight: 700; fill: ${LABEL_INK}; }
    .caption { font-size: ${CAPTION_SIZE}px; fill: ${LABEL_INK}; }
    .row-letter { font-size: ${LETTER_SIZE}px; font-weight: 700; fill: ${LABEL_INK}; }
    .bar-note { font-weight: 700; fill: #ffffff; }
    .leader { stroke-width: 2; }
    .callout-letter { font-size: ${CALLOUT_LETTER_SIZE}px; font-weight: 700; fill: ${LABEL_INK}; }
    .callout-label { font-size: ${CALLOUT_TEXT_SIZE}px; fill: ${LABEL_INK}; }
    .callout-value { font-size: ${CALLOUT_TEXT_SIZE}px; font-weight: 700; fill: ${LABEL_INK}; }
  </style>`
}

/** Titre de l'étiquette et légendes haute et basse de l'échelle. */
export function renderFrame({
  title,
  topCaption,
  bottomCaption,
}: {
  title: string
  topCaption: string
  bottomCaption: string
}): string {
  const titleSize = fitFontSize(title, CONTENT_WIDTH, TITLE_SIZE, TITLE_SIZE_MIN)
  return `  <text class="title" font-size="${titleSize}px" x="${PAD_X}" y="${TITLE_BASELINE}">${escapeXml(title)}</text>
  <text class="caption" x="${PAD_X}" y="${TOP_CAPTION_BASELINE}">${escapeXml(topCaption)}</text>
  <text class="caption" x="${PAD_X}" y="${BOTTOM_CAPTION_BASELINE}">${escapeXml(bottomCaption)}</text>`
}

/**
 * Enveloppe SVG complète. La maquette ne borde pas l'étiquette : on se
 * contente d'un fond blanc, pour que le SVG reste opaque là où il est posé.
 */
export function renderSvg({
  ariaLabel,
  title,
  body,
}: {
  ariaLabel: string
  title: string
  body: string
}): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}" role="img" aria-label="${escapeXml(ariaLabel)}">
  <title>${escapeXml(title)}</title>
${styleBlock()}
  <rect width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" fill="#ffffff"/>
${body}
</svg>`
}
