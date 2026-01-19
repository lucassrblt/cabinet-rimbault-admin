/**
 * GES (Gaz à Effet de Serre) Label Generator
 * Generates SVG labels for greenhouse gas emissions classification
 * Based on the official French 2021 model from outils.immo
 */

export type GesClass = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'

// Index de chaque classe
const CLASS_INDEX: Record<GesClass, number> = {
  A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6
}

// Couleurs pour chaque classe
const COLORS: Record<GesClass, string> = {
  A: '#a4dbf8',
  B: '#8cb4d3',
  C: '#7792b1',
  D: '#606f8f',
  E: '#4d5271',
  F: '#393551',
  G: '#281b35',
}

// Largeurs des barres
const BAR_WIDTHS: Record<GesClass, number> = {
  A: 28,
  B: 46,
  C: 57,
  D: 68,
  E: 80,
  F: 91,
  G: 102,
}

// Configuration des barres
const BAR_HEIGHT_NORMAL = 15
const BAR_HEIGHT_SELECTED = 28
const BAR_GAP = 3
const BAR_START_Y = 55
const LEFT_X = 5

// Calcule la position Y d'une barre en fonction de son index et de la classe sélectionnée
function getBarY(index: number, selectedIndex: number): { top: number; bottom: number; center: number; isSelected: boolean } {
  const isSelected = index === selectedIndex
  let y = BAR_START_Y
  
  // Ajoute la hauteur des barres précédentes
  for (let i = 0; i < index; i++) {
    if (i === selectedIndex) {
      y += BAR_HEIGHT_SELECTED + BAR_GAP
    } else {
      y += BAR_HEIGHT_NORMAL + BAR_GAP
    }
  }
  
  const height = isSelected ? BAR_HEIGHT_SELECTED : BAR_HEIGHT_NORMAL
  
  return {
    top: y,
    bottom: y + height,
    center: y + height / 2,
    isSelected
  }
}

/**
 * Generate a GES (greenhouse gas emissions) label as SVG
 * @param value - The GES value in kg CO₂/m²/an
 * @param letter - The GES class (A to G)
 * @returns SVG string
 */
export function generateGesSvg(value: number, letter: GesClass): string {
  const selectedClass = letter.toUpperCase() as GesClass
  const selectedIndex = CLASS_INDEX[selectedClass]
  
  // Génère toutes les barres
  const bars = (['A', 'B', 'C', 'D', 'E', 'F', 'G'] as GesClass[]).map((l, index) => {
    return generateBar(l, index, selectedIndex, value)
  }).join('\n')
  
  return `<?xml version="1.0" encoding="UTF-8"  ?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200" viewBox="0 0 200 200">
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
    font-size: 8px;
  }
  
  .ges_copyright {
    font-size: 4px;
    fill: grey;
  }
  
  .ges_unite {
    font-size: 7px;
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
<rect width="198" height="198" rx="4" transform="translate(1 1)" fill="none" stroke="#a5dbf8" stroke-miterlimit="10" stroke-width="1"/>


   <!-- Texte intro -->
   <text class="ges_intro" x="10" y="20">Performance climatique</text>

   <text class="ges_legende">
    <tspan x="5.8" y="35"><tspan fill="#a5dbf8">*</tspan> Dont émissions de gaz à effet de serre</tspan>
   </text>


${bars}

<text class="ges_text_min" x="6" y="50">Peu d'émissions de CO₂</text>
<text class="ges_text_max" x="6" y="190.12">Émissions de CO₂ très importantes</text>

  <a href="https://www.outils.immo/">
    <text class="ges_copyright" x="160" y="195">www.outils.immo</text>
  </a>

</svg>`
}

function generateBar(
  letter: GesClass, 
  index: number, 
  selectedIndex: number, 
  value: number
): string {
  const pos = getBarY(index, selectedIndex)
  const color = COLORS[letter]
  const width = BAR_WIDTHS[letter]
  
  if (pos.isSelected) {
    // Barre sélectionnée (grande)
    const height = BAR_HEIGHT_SELECTED
    const radius = height / 2
    return `  <!-- ${letter} (sélectionné) -->
  <path d="M${LEFT_X},${pos.bottom}L${LEFT_X},${pos.top}L${width - radius},${pos.top}A${radius},${radius} 0 0 1 ${width - radius},${pos.bottom}L${LEFT_X},${pos.bottom}Z" fill="${color}" stroke="black"/>
  <text class="ges_letter_big" x="10" y="${pos.center + 6}">${letter}</text>
  <line stroke="#1d1d1b" stroke-width="1" x1="${width + 5}" x2="125" y1="${pos.center}" y2="${pos.center}"/>
  <text class="ges_valeur" x="130" y="${pos.center + 5}">${value}</text>
  <text class="ges_unite" x="150" y="${pos.center + 5}">kg CO₂/m²/an</text>`
  } else {
    // Barre normale (petite)
    const height = BAR_HEIGHT_NORMAL
    const radius = height / 2
    return `  <!-- ${letter} -->
  <path d="M${LEFT_X},${pos.bottom}L${LEFT_X},${pos.top}L${width - radius},${pos.top}A${radius},${radius} 0 0 1 ${width - radius},${pos.bottom}L${LEFT_X},${pos.bottom}Z" fill="${color}"/>
  <text class="ges_letter" x="9" y="${pos.center + 4}">${letter}</text>`
  }
}

export default generateGesSvg
