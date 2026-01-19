/**
 * DPE (Diagnostic de Performance Énergétique) Label Generator
 * Generates SVG labels for energy performance classification
 * Based on the official French 2021 model from outils.immo
 */

export type DpeClass = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'

// Index de chaque classe
const CLASS_INDEX: Record<DpeClass, number> = {
  A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6
}

// Couleurs pour chaque classe
const COLORS: Record<DpeClass, string> = {
  A: '#00a06d',
  B: '#52b153',
  C: '#a5cc74',
  D: '#f4e70f',
  E: '#f0b40f',
  F: '#eb8235',
  G: '#d7221f',
}

// Largeurs des flèches (bord droit)
const ARROW_WIDTHS: Record<DpeClass, number> = {
  A: 103,
  B: 113,
  C: 124,
  D: 135,
  E: 146,
  F: 157,
  G: 168,
}

// Configuration des flèches
const ARROW_HEIGHT_NORMAL = 15
const ARROW_HEIGHT_SELECTED = 28
const ARROW_GAP = 1
const ARROW_START_Y = 55
const ARROW_TIP_NORMAL = 5
const ARROW_TIP_SELECTED = 9.5
const LEFT_X = 74.69

// Calcule la position Y d'une flèche en fonction de son index et de la classe sélectionnée
function getArrowY(index: number, selectedIndex: number): { top: number; bottom: number; center: number; isSelected: boolean } {
  const isSelected = index === selectedIndex
  let y = ARROW_START_Y
  
  // Ajoute la hauteur des flèches précédentes
  for (let i = 0; i < index; i++) {
    if (i === selectedIndex) {
      y += ARROW_HEIGHT_SELECTED + ARROW_GAP
    } else {
      y += ARROW_HEIGHT_NORMAL + ARROW_GAP
    }
  }
  
  const height = isSelected ? ARROW_HEIGHT_SELECTED : ARROW_HEIGHT_NORMAL
  
  return {
    top: y,
    bottom: y + height,
    center: y + height / 2,
    isSelected
  }
}

/**
 * Generate a DPE (energy performance) label as SVG
 */
export function generateDpeSvg(
  energyValue: number,
  energyClass: DpeClass,
  gesValue: number
): string {
  const selectedClass = energyClass.toUpperCase() as DpeClass
  const selectedIndex = CLASS_INDEX[selectedClass]
  
  // Génère toutes les flèches
  const arrows = (['A', 'B', 'C', 'D', 'E', 'F', 'G'] as DpeClass[]).map((letter, index) => {
    return generateArrow(letter, index, selectedIndex, energyValue, gesValue)
  }).join('\n')
  
  // Position de la ligne "passoire énergétique" (entre D et E)
  const posD = getArrowY(3, selectedIndex)
  const passoireY = posD.bottom + 3
  
  return `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
 <!--  Générateur d'étiquette DPE et GES , par https://www.outils.immo -->

 <style>
 text {
    font-family: Arial;
    font-weight: bold;
  }
  
  .ges_valeur {
    font-size: 15px;
  }

  .ges_intro {
    font-size: 12px;
  }
  
  .ges_legende {
    font-size: 6.5px;
  }
  .ges_copyright {
    font-size: 4px;
    fill: grey;
  }
  
  .ges_unite {
    font-size: 4px;
  }
  
  .ges_text_min,
  .ges_text_max {
    font-size: 7px;
  }
  .ges_text_min {
    fill: #a4dbf8;
  }
  .ges_text_max {
    fill: #281b35;
  }
  .ges_letter {
    font-size: 12px;
    fill: white;
  }
  .ges_letter_big {
    font-size: 18px;
    fill: white;
  }
  .ges_overlay_text {
    font-size: 12px;
  }
  </style>

  <!-- Encadrement -->
  <rect width="198" height="198" rx="4" transform="translate(1 1)" fill="none" stroke="#a5cc74" stroke-miterlimit="10" stroke-width="1"/>

  <text class="ges_intro" x="10" y="20">Performance énergétique️</text>
  
  <text fill="#00a06d" class="ges_legende" x="75" y="50">Logement trés performant</text>
  <text fill="#d7221f" class="ges_legende" x="75" y="188">Logement extrêmement peu performant</text>

${arrows}

  <!-- Passoire énergétique -->
  <line stroke="grey" x1="70" x2="70" y1="${passoireY}" y2="${passoireY + 46}"/>
  <text class="ges_legende" fill="grey" x="40" y="${passoireY + 30}">passoire </text>
  <text class="ges_legende" fill="grey" x="30" y="${passoireY + 37}">énergétique</text>
 
</svg>`
}

function generateArrow(
  letter: DpeClass, 
  index: number, 
  selectedIndex: number, 
  energyValue: number, 
  gesValue: number
): string {
  const pos = getArrowY(index, selectedIndex)
  const color = COLORS[letter]
  const width = ARROW_WIDTHS[letter]
  
  if (pos.isSelected) {
    // Flèche sélectionnée (grande)
    const tip = ARROW_TIP_SELECTED
    return `  <!-- ${letter} (sélectionné) -->
  <path d="M${LEFT_X},${pos.top}L${width},${pos.top}L${width + tip},${pos.center}L${width},${pos.bottom}L${LEFT_X},${pos.bottom}Z" fill="${color}" stroke="black"/>
  <text class="ges_letter_big" x="80" y="${pos.center + 6}" stroke="black">${letter}</text>
${generateValueBox(energyValue, gesValue, pos.top)}`
  } else {
    // Flèche normale (petite)
    const tip = ARROW_TIP_NORMAL
    return `  <!-- ${letter} -->
  <path d="M${LEFT_X},${pos.top}L${width},${pos.top}L${width + tip},${pos.center}L${width},${pos.bottom}L${LEFT_X},${pos.bottom}Z" fill="${color}"/>
  <text class="ges_letter" x="80" y="${pos.center + 4}">${letter}</text>`
  }
}

function generateValueBox(energyValue: number, gesValue: number, arrowTop: number): string {
  // Le cadre fait exactement la taille de la flèche et est parfaitement aligné
  const boxTop = arrowTop
  const boxHeight = ARROW_HEIGHT_SELECTED  // 28px, même hauteur que la flèche
  
  // Les titres sont 2px au-dessus du cadre
  const titlesBottom = boxTop - 2  // 2px au-dessus du cadre
  
  return `  <!-- Cadre de valeurs -->
  <g>
    <!-- Titres 2px au-dessus du cadre -->
    <text class="ges_unite" y="${titlesBottom - 5}" x="7">Consommation</text>
    <text class="ges_unite" y="${titlesBottom}" x="5" fill="grey">(énergie primaire)</text>
    <text class="ges_unite" y="${titlesBottom - 2}" x="46">Émissions</text>
    <!-- Cadre avec les valeurs (même taille que la flèche) -->
    <path d="M${LEFT_X - 0.1},${boxTop}L${LEFT_X - 0.1},${boxTop + boxHeight}L6,${boxTop + boxHeight}C4.5,${boxTop + boxHeight} 3.5,${boxTop + boxHeight - 1} 3.5,${boxTop + boxHeight - 2.5}L3.5,${boxTop + 2.5}C3.5,${boxTop + 1} 4.5,${boxTop} 6,${boxTop}L${LEFT_X - 0.1},${boxTop}Z" fill="none" stroke="#1d1d1b" stroke-width="1"/>
    <rect x="4" y="${boxTop + 1}" width="${LEFT_X - 5}" height="${boxHeight - 2}" fill="white"/>
    <text class="ges_valeur" x="10" y="${boxTop + 18}">${energyValue}</text>
    <text class="ges_valeur" x="45" y="${boxTop + 18}">${gesValue}<tspan fill="#a5dbf8">*</tspan></text>
    <text class="ges_unite" x="45" y="${boxTop + 25}">kg CO₂/m²/an</text>
    <text class="ges_unite" x="10" y="${boxTop + 25}">kWh/m².an</text>
    <line stroke="black" x1="41" x2="41" y1="${boxTop + 2}" y2="${boxTop + boxHeight - 2}"/>
  </g>`
}

export default generateDpeSvg
