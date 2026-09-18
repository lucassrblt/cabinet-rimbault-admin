/**
 * Étiquette DPE (Diagnostic de Performance Énergétique).
 *
 * Nouveau modèle : échelle verticale de A à G en flèches, la classe retenue
 * étant reliée par une ligne de rappel à un encadré qui porte la consommation
 * en énergie primaire, l'énergie finale (quand elle est connue) et les
 * émissions. Géométrie : voir `./label-layout`, relevée sur la maquette.
 *
 * Tout est produit localement, sans appel réseau ni lien sortant embarqué.
 * Couleurs : voir `./scale`, source de vérité unique.
 */

import {
  BAR_LEFT_AFTER_RADIUS,
  BAR_X,
  type CalloutEntry,
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
import { DPE_COLORS, isPassoireEnergetique, type EnergyClass } from "./scale"
import { formatNumber } from "./svg-text"

export type DpeClass = EnergyClass

/** Longueur de la pointe de la flèche, au-delà du corps de la barre. */
const ARROW_TIP = 15

/**
 * Mention portée par les seules classes F et G (loi Climat & Résilience) ;
 * E n'en fait pas partie. Blanche sur les deux, comme sur la maquette.
 */
const PASSOIRE_NOTE = "Passoire énergétique"

/** Flèche d'une classe : corps rectangulaire et pointe vers la droite. */
function arrowPath(letter: DpeClass): string {
  const { top, bottom, center } = rowY(letter)
  const apex = BAR_X + barWidth(letter)
  const bodyRight = round(apex - ARROW_TIP)
  return barPath(
    top,
    bottom,
    `H${bodyRight}L${apex},${center}L${bodyRight},${bottom}L${BAR_LEFT_AFTER_RADIUS},${bottom}`,
  )
}

/**
 * Génère l'étiquette DPE en SVG.
 *
 * @param energyValue Consommation en énergie primaire, en kWh/m².an
 * @param energyClass Classe retenue par le diagnostiqueur (A–G)
 * @param gesValue Émissions associées, en kg CO₂/m².an
 * @param finalEnergyValue Consommation en énergie finale, en kWh/m².an.
 *   Facultative : la ligne correspondante n'est dessinée que si elle est
 *   renseignée, l'encadré se resserrant alors sur deux blocs.
 */
export function generateDpeSvg(
  energyValue: number,
  energyClass: DpeClass,
  gesValue: number,
  finalEnergyValue?: number | null,
): string {
  const selected = energyClass.toUpperCase() as DpeClass

  const entries: CalloutEntry[] = [
    {
      label: "Consommation (énergie primaire)",
      value: `${formatNumber(energyValue)} kWh/m².an`,
    },
  ]
  if (finalEnergyValue != null) {
    entries.push({
      label: "Énergie finale",
      value: `${formatNumber(finalEnergyValue)} kWh/m².an`,
    })
  }
  entries.push({
    label: "Émissions",
    value: `${formatNumber(gesValue)} kg CO₂/m².an`,
  })

  const rows = renderRows((letter) =>
    renderRow({
      letter,
      shape: arrowPath(letter),
      color: DPE_COLORS[letter],
      note: isPassoireEnergetique(letter) ? PASSOIRE_NOTE : undefined,
    }),
  )

  const body = `${renderFrame({
    title: "Diagnostic de performance énergétique (DPE)",
    topCaption: "Logement économe",
    bottomCaption: "Logement énergivore",
  })}

${rows}

${renderCallout({
  letter: selected,
  entries,
  barRight: BAR_X + barWidth(selected),
  accent: DPE_COLORS[selected],
})}`

  return renderSvg({
    ariaLabel: `Étiquette DPE : classe ${selected}, ${energyValue} kWh/m².an`,
    title: `Étiquette DPE — classe ${selected}, ${energyValue} kWh/m².an`,
    body,
  })
}

export default generateDpeSvg
