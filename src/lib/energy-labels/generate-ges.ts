/**
 * GES (Gaz à Effet de Serre) Label Generator
 * Generates SVG labels for greenhouse gas emissions classification
 * Based on the official French 2021 model from outils.immo
 */

export type GesClass = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'

/**
 * Generate a GES (greenhouse gas emissions) label as SVG
 * @param value - The GES value in kg CO₂/m²/an
 * @param letter - The GES class (A to G)
 * @returns SVG string
 */
export function generateGesSvg(value: number, letter: GesClass): string {
  const selectedClass = letter.toUpperCase() as GesClass
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
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
</style>

<!-- Encadrement -->
<rect width="198" height="198" rx="4" transform="translate(1 1)" fill="none" stroke="#a5dbf8" stroke-miterlimit="10" stroke-width="1"/>

<!-- Texte intro -->
<text class="ges_intro" x="10" y="20">Performance climatique</text>
<text class="ges_legende">
  <tspan x="5.8" y="35"><tspan fill="#a5dbf8">*</tspan> Dont émissions de gaz à effet de serre</tspan>
</text>

<!-- Class A -->
${selectedClass === 'A' ? generateSelectedA(value) : generateNormalA()}

<!-- Class B -->
${selectedClass === 'B' ? generateSelectedB(value) : generateNormalB()}

<!-- Class C -->
${selectedClass === 'C' ? generateSelectedC(value) : generateNormalC()}

<!-- Class D -->
${selectedClass === 'D' ? generateSelectedD(value) : generateNormalD()}

<!-- Class E -->
${selectedClass === 'E' ? generateSelectedE(value) : generateNormalE()}

<!-- Class F -->
${selectedClass === 'F' ? generateSelectedF(value) : generateNormalF()}

<!-- Class G -->
${selectedClass === 'G' ? generateSelectedG(value) : generateNormalG()}

<!-- Légendes -->
<text class="ges_text_min" x="6" y="50">Peu d'émissions de CO₂</text>
<text class="ges_text_max" x="6" y="190.12">Émissions de CO₂ très importantes</text>

</svg>`
}

// ========== NORMAL BARS (non-selected) ==========

function generateNormalA(): string {
  return `<path d="m5.62,67.34l21.67,0a6.37,6.37 0 0 0 6.38,-6.38l0,0a6.37,6.37 0 0 0 -6.38,-6.37l-21.67,0l0,12.75z" fill="#a4dbf8"/>
<text class="ges_letter" x="9" y="65">A</text>`
}

function generateNormalB(): string {
  return `<g transform="translate(0 -15)">
  <path d="m5.24,98.83l45.6,0a7.26,7.26 0 0 0 7.26,-7.26l0,0a7.26,7.26 0 0 0 -7.26,-7.23l-45.6,0l0,14.49z" fill="#8cb4d3"/>
  <path d="m9.7,87.23l4.2,0a2.1,2.1 0 0 1 2.27,2.22c0,1.37 -0.73,1.82 -1.61,1.86l0,0.08a1.91,1.91 0 0 1 1.95,2.04a2.32,2.32 0 0 1 -2.23,2.46l-4.58,0l0,-8.66zm1.87,3.55l1.88,0a0.74,0.74 0 0 0 0.8,-0.8l0,-0.38a0.73,0.73 0 0 0 -0.8,-0.79l-1.88,0l0,1.96zm0,3.51l2.18,0a0.72,0.72 0 0 0 0.8,-0.77l0,-0.42a0.73,0.73 0 0 0 -0.8,-0.79l-2.18,0l0,1.98z" fill="#fff"/>
</g>`
}

function generateNormalC(): string {
  return `<path d="m5.24,116.81l56.83,0a7.26,7.26 0 0 0 7.27,-7.27l0,0a7.26,7.26 0 0 0 -7.27,-7.27l-56.83,0l0,14.54z" fill="#7792b1"/>
<text class="ges_letter" x="9" y="112">C</text>`
}

function generateNormalD(): string {
  return `<path d="m5.24,131.42l68.37,0a7.26,7.26 0 0 0 7.26,-7.27l0,0a7.27,7.27 0 0 0 -7.26,-7.32l-68.37,0l0,14.59z" fill="#606f8f"/>
<path d="m9.85,120.39l3.25,0c2.3,0 3.82,1.38 3.82,4.33s-1.52,4.33 -3.82,4.33l-3.25,0l0,-8.66zm3.25,6.98c1.12,0 1.82,-0.6 1.82,-1.98l0,-1.38c0,-1.38 -0.69,-1.98 -1.82,-1.98l-1.38,0l0,5.3l1.38,0.05z" fill="#fff"/>`
}

function generateNormalE(): string {
  return `<path d="m5.24,148.56l79.71,0a7.26,7.26 0 0 0 7.27,-7.27l0,0a7.27,7.27 0 0 0 -7.27,-7.27l-79.71,0l0,14.54z" fill="#4d5271"/>
<path d="m10.4,145.61l0,-8.65l5.89,0l0,1.66l-4,0l0,1.78l3.5,0l0,1.66l-3.5,0l0,1.87l4,0l0,1.67l-5.89,0z" fill="#fff"/>`
}

function generateNormalF(): string {
  return `<path d="m5.24,165.13l91.03,0a7.27,7.27 0 0 0 7.27,-7.27l0,0a7.26,7.26 0 0 0 -7.27,-7.27l-91.03,0l0,14.54z" fill="#393551"/>
<path d="m10.54,162.19l0,-8.65l5.74,0l0,1.66l-3.85,0l0,1.78l3.27,0l0,1.71l-3.27,0l0,3.54l-1.89,-0.05z" fill="#fff"/>`
}

function generateNormalG(): string {
  return `<path d="m5.24,181.71l102.47,0a7.27,7.27 0 0 0 7.27,-7.27l0,0a7.26,7.26 0 0 0 -7.27,-7.27l-102.47,0l0,14.54z" fill="#281b35"/>
<path d="m15.19,177.4l0,0c-0.11,0.87 -0.92,1.53 -2.21,1.53c-1.98,0 -3.55,-1.55 -3.55,-4.44s1.58,-4.5 3.93,-4.5a3.45,3.45 0 0 1 3.33,2l-1.54,0.87a1.79,1.79 0 0 0 -1.8,-1.21c-1.16,0 -1.93,0.67 -1.93,2.11l0,1.38c0,1.44 0.76,2.1 1.93,2.1c0.95,0 1.7,-0.43 1.7,-1.28l0,-0.44l-1.66,0l0,-1.56l3.42,0l0,4.82l-1.59,0l-0.01,-1.37z" fill="#fff"/>`
}

// ========== SELECTED BARS (with value indicator) ==========

function generateSelectedA(value: number): string {
  return `<path d="m5.61,74.34l0,-28.16l21.67,0a15.23,14.09 0 0 1 0,28.16l-21.67,0z" fill="#a4dbf8" stroke="black"/>
<text class="ges_letter_big" x="10" y="65">A</text>
<line stroke="#1d1d1b" stroke-width="1" x1="42" x2="125" y1="60" y2="60"/>
<text class="ges_valeur" x="130" y="65">${value}</text>
<text class="ges_unite" x="${130 + String(value).length * 9 + 5}" y="65">kg CO₂/m²/an</text>`
}

function generateSelectedB(value: number): string {
  return `<path d="m5.61,91.34l0,-28.16l45.6,0a15.23,14.09 0 0 1 0,28.16l-45.6,0z" fill="#8cb4d3" stroke="black"/>
<text class="ges_letter_big" x="10" y="82">B</text>
<line stroke="#1d1d1b" stroke-width="1" x1="66" x2="125" y1="77" y2="77"/>
<text class="ges_valeur" x="130" y="82">${value}</text>
<text class="ges_unite" x="${130 + String(value).length * 9 + 5}" y="82">kg CO₂/m²/an</text>`
}

function generateSelectedC(value: number): string {
  return `<path d="m5.61,116.81l0,-28.16l48.76,0a15.23,14.09 0 0 1 0,28.16l-48.76,0z" transform="translate(0 -2.5)" fill="#7792b1" stroke="black"/>
<text class="ges_letter_big" x="10" y="106">C</text>
<line stroke="#1d1d1b" stroke-width="1" x1="73" x2="125" y1="100" y2="100"/>
<text class="ges_valeur" x="130" y="106">${value}</text>
<text class="ges_unite" x="${130 + String(value).length * 9 + 5}" y="106">kg CO₂/m²/an</text>`
}

function generateSelectedD(value: number): string {
  return `<path d="m5.61,138.42l0,-28.16l68.37,0a15.23,14.09 0 0 1 0,28.16l-68.37,0z" fill="#606f8f" stroke="black"/>
<text class="ges_letter_big" x="10" y="129">D</text>
<line stroke="#1d1d1b" stroke-width="1" x1="89" x2="125" y1="124" y2="124"/>
<text class="ges_valeur" x="130" y="129">${value}</text>
<text class="ges_unite" x="${130 + String(value).length * 9 + 5}" y="129">kg CO₂/m²/an</text>`
}

function generateSelectedE(value: number): string {
  return `<path d="m5.61,155.56l0,-28.16l79.71,0a15.23,14.09 0 0 1 0,28.16l-79.71,0z" fill="#4d5271" stroke="black"/>
<text class="ges_letter_big" x="10" y="146">E</text>
<line stroke="#1d1d1b" stroke-width="1" x1="100" x2="125" y1="141" y2="141"/>
<text class="ges_valeur" x="130" y="146">${value}</text>
<text class="ges_unite" x="${130 + String(value).length * 9 + 5}" y="146">kg CO₂/m²/an</text>`
}

function generateSelectedF(value: number): string {
  return `<path d="m5.61,172.13l0,-28.16l91.03,0a15.23,14.09 0 0 1 0,28.16l-91.03,0z" fill="#393551" stroke="black"/>
<text class="ges_letter_big" x="10" y="163">F</text>
<line stroke="#1d1d1b" stroke-width="1" x1="111" x2="125" y1="158" y2="158"/>
<text class="ges_valeur" x="130" y="163">${value}</text>
<text class="ges_unite" x="${130 + String(value).length * 9 + 5}" y="163">kg CO₂/m²/an</text>`
}

function generateSelectedG(value: number): string {
  return `<path d="m5.61,188.71l0,-28.16l102.47,0a15.23,14.09 0 0 1 0,28.16l-102.47,0z" fill="#281b35" stroke="black"/>
<text class="ges_letter_big" x="10" y="179">G</text>
<line stroke="#1d1d1b" stroke-width="1" x1="122" x2="125" y1="175" y2="175"/>
<text class="ges_valeur" x="130" y="179">${value}</text>
<text class="ges_unite" x="${130 + String(value).length * 9 + 5}" y="179">kg CO₂/m²/an</text>`
}

export default generateGesSvg
