/**
 * Étiquette GES (indice d'émission de gaz à effet de serre).
 *
 * Nouveau modèle : même gabarit que l'étiquette DPE, mais des barres à bout
 * arrondi, la palette GES (bleu clair → violet foncé) et un encadré qui ne
 * porte que les émissions. Géométrie : voir `./label-layout`.
 *
 * Tout est produit localement, sans appel réseau ni lien sortant embarqué.
 * Couleurs : voir `./scale`, source de vérité unique.
 */

import {
  BAR_HEIGHT,
  BAR_LEFT_AFTER_RADIUS,
  BAR_X,
  barPath,
  barWidth,
  renderCallout,
  renderFrame,
  renderRow,
  renderRows,
  renderSvg,
  round,
  rowY,
} from "./label-layout"
import { GES_COLORS, type EnergyClass } from "./scale"
import { formatNumber } from "./svg-text"

export type GesClass = EnergyClass

/** Rayon du bout arrondi : une demi-hauteur, donc une vraie capsule. */
const BAR_RADIUS = BAR_HEIGHT / 2

/** Barre d'une classe : bout droit arrondi en demi-cercle. */
function capsulePath(letter: GesClass): string {
  const { top, bottom } = rowY(letter)
  const arcStart = round(BAR_X + barWidth(letter) - BAR_RADIUS)
  return barPath(
    top,
    bottom,
    `H${arcStart}A${BAR_RADIUS},${BAR_RADIUS} 0 0 1 ${arcStart},${bottom}L${BAR_LEFT_AFTER_RADIUS},${bottom}`,
  )
}

/**
 * Génère l'étiquette GES en SVG.
 *
 * @param value Émissions en kg CO₂/m².an
 * @param letter Classe GES retenue (A–G)
 */
export function generateGesSvg(value: number, letter: GesClass): string {
  const selected = letter.toUpperCase() as GesClass

  const rows = renderRows((l) =>
    renderRow({ letter: l, shape: capsulePath(l), color: GES_COLORS[l] }),
  )

  const body = `${renderFrame({
    title: "Indice d'émission de gaz à effet de serre (GES)",
    topCaption: "Faible émission de GES",
    bottomCaption: "Forte émission de GES",
  })}

${rows}

${renderCallout({
  letter: selected,
  entries: [
    { label: "Émissions", value: `${formatNumber(value)} kg CO₂/m².an` },
  ],
  barRight: BAR_X + barWidth(selected),
  accent: GES_COLORS[selected],
})}`

  return renderSvg({
    ariaLabel: `Étiquette GES : classe ${selected}, ${value} kg CO₂/m².an`,
    title: `Étiquette GES — classe ${selected}, ${value} kg CO₂/m².an`,
    body,
  })
}

export default generateGesSvg
