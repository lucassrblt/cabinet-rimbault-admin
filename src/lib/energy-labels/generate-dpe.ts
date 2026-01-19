/**
 * DPE (Diagnostic de Performance Énergétique) Label Generator
 * Generates SVG labels for energy performance classification
 * Based on the official French 2021 model from outils.immo
 */

export type DpeClass = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'

// Transform Y values for the value box based on selected class
const VALUE_BOX_TRANSFORMS: Record<DpeClass, number> = {
  A: -85,
  B: -69,
  C: -53,
  D: -49.3,
  E: -21,
  F: -5,
  G: 11,
}

/**
 * Generate a DPE (energy performance) label as SVG
 * @param energyValue - The energy consumption in kWh/m².an
 * @param energyClass - The DPE class (A to G)
 * @param gesValue - The GES value in kg CO₂/m²/an (for the info box)
 * @returns SVG string
 */
export function generateDpeSvg(
  energyValue: number,
  energyClass: DpeClass,
  gesValue: number
): string {
  const selectedClass = energyClass.toUpperCase() as DpeClass
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
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
  .ges_unite {
    font-size: 4px;
  }
  .ges_text_min,
  .ges_text_max {
    font-size: 7px;
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
<rect width="198" height="198" rx="4" transform="translate(1 1)" fill="none" stroke="#a5cc74" stroke-miterlimit="10" stroke-width="1"/>

<!-- Titre -->
<text class="ges_intro" x="10" y="20">Performance énergétique️</text>

<!-- Légendes -->
<text fill="#00a06d" class="ges_legende" x="75" y="50">Logement très performant</text>
<text fill="#d7221f" class="ges_legende" x="75" y="188">Logement extrêmement peu performant</text>

<!-- Class A -->
${selectedClass === 'A' ? generateSelectedA(energyValue, gesValue) : generateNormalA()}

<!-- Class B -->
${selectedClass === 'B' ? generateSelectedB(energyValue, gesValue) : generateNormalB()}

<!-- Class C -->
${selectedClass === 'C' ? generateSelectedC(energyValue, gesValue) : generateNormalC()}

<!-- Class D -->
${selectedClass === 'D' ? generateSelectedD(energyValue, gesValue) : generateNormalD()}

<!-- Passoire énergétique -->
<line stroke="grey" x1="70" x2="70" y1="133" y2="179"/>
<text class="ges_legende" fill="grey" x="40" y="163">passoire</text>
<text class="ges_legende" fill="grey" x="30" y="170">énergétique</text>

<!-- Class E -->
${selectedClass === 'E' ? generateSelectedE(energyValue, gesValue) : generateNormalE()}

<!-- Class F -->
${selectedClass === 'F' ? generateSelectedF(energyValue, gesValue) : generateNormalF()}

<!-- Class G -->
${selectedClass === 'G' ? generateSelectedG(energyValue, gesValue) : generateNormalG()}

</svg>`
}

// ========== VALUE BOX ==========

function generateValueBox(energyValue: number, gesValue: number, translateY: number): string {
  return `<g transform="translate(0 ${translateY})">
  <text class="ges_unite" y="145" x="7">consommation</text>
  <text class="ges_unite" y="150" x="5" fill="grey">(énergie primaire)</text>
  <text class="ges_unite" y="148" x="46">émissions</text>
  <text class="ges_valeur" x="10" y="170">${energyValue}</text>
  <text class="ges_valeur" x="45" y="170">${gesValue}<tspan fill="#a5dbf8">*</tspan></text>
  <text class="ges_unite" x="45" y="178">kg CO₂/m²/an</text>
  <text class="ges_unite" x="13" y="178">kWh/m².an</text>
  <line stroke="black" x1="41" x2="41" y1="152.71" y2="180.33"/>
  <path d="m74.59,152.9l0,27.16l-67.33,0a1.65,1.39 0 0 1 -1.21,-0.44a1.87,1.58 0 0 1 -0.5,-1.09l0,-24.1a1.76,1.49 0 0 1 1.7,-1.53l67.33,0m1.01,-0.91l-68.34,0a2.81,2.37 0 0 0 -2.71,2.44l0,24.08a2.81,2.37 0 0 0 2.71,2.44l68.34,0l0,-28.99l0,0.02l0,0.01z" fill="#1d1d1b"/>
</g>`
}

// ========== NORMAL ARROWS (non-selected) ==========

function generateNormalA(): string {
  return `<path d="m102.27,69.63l-27.58,0l0,-14.99l27.58,0l4.76,7.49l-4.76,7.49l0,0.01z" fill="#00a06d"/>
<text class="ges_letter" x="80" y="67">A</text>`
}

function generateNormalB(): string {
  return `<path d="m113.32,85.64l-38.61,0l0,-14.99l38.61,0l4.76,7.49l-4.76,7.49l0,0.01z" fill="#52b153"/>
<text class="ges_letter" x="80" y="82">B</text>`
}

function generateNormalC(): string {
  return `<path d="m124.27,102.03l-49.54,0l0,-14.99l49.54,0l4.77,7.49l-4.77,7.49l0,0.01z" fill="#a5cc74"/>
<text class="ges_letter" x="80" y="99">C</text>`
}

function generateNormalD(): string {
  return `<path d="m135.27,118.42l-60.58,0l0,-14.99l60.58,0l4.76,7.49l-4.76,7.49l0,0.01z" fill="#f4e70f"/>
<text class="ges_letter" x="80" y="115">D</text>`
}

function generateNormalE(): string {
  return `<g transform="translate(0 13)">
  <path d="m146.22,134.43l-71.44,0l0,-14.99l71.44,0l4.77,7.49l-4.77,7.49l0,0.01z" fill="#f0b40f"/>
  <text class="ges_letter" x="80" y="131">E</text>
</g>`
}

function generateNormalF(): string {
  return `<g transform="translate(0 13)">
  <path d="m157.15,150.63l-82.34,0l0,-14.99l82.34,0l4.76,7.49l-4.76,7.49l0,0.01z" fill="#eb8235"/>
  <text class="ges_letter" x="80" y="148">F</text>
</g>`
}

function generateNormalG(): string {
  return `<path d="m168.4,179.84l-93.64,0l0,-14.74l93.64,0l4.39,7.36l-4.39,7.38z" fill="#d7221f"/>
<text class="ges_letter" x="80" y="177">G</text>`
}

// ========== SELECTED ARROWS (with value box) ==========

function generateSelectedA(energyValue: number, gesValue: number): string {
  return `<path d="m74.69,82.99l0,-27.71l27.58,0l9.45,13.85l-9.45,13.85l-27.58,0l0,0.01z" fill="#00a06d" stroke="black"/>
<text class="ges_letter_big" x="80" y="75">A</text>
${generateValueBox(energyValue, gesValue, VALUE_BOX_TRANSFORMS.A)}`
}

function generateSelectedB(energyValue: number, gesValue: number): string {
  return `<path d="m74.69,98.99l0,-27.71l38.61,0l9.45,13.85l-9.45,13.85l-38.61,0l0,0.01z" fill="#52b153" stroke="black"/>
<text class="ges_letter_big" x="80" y="91">B</text>
${generateValueBox(energyValue, gesValue, VALUE_BOX_TRANSFORMS.B)}`
}

function generateSelectedC(energyValue: number, gesValue: number): string {
  return `<path d="m74.69,114.99l0,-27.71l49.54,0l9.45,13.85l-9.45,13.85l-49.54,0l0,0.01z" fill="#a5cc74" stroke="black"/>
<text class="ges_letter_big" x="80" y="107">C</text>
${generateValueBox(energyValue, gesValue, VALUE_BOX_TRANSFORMS.C)}`
}

function generateSelectedD(energyValue: number, gesValue: number): string {
  return `<path d="m74.69,130.99l0,-27.71l63.07,0l9.45,13.85l-9.45,13.85l-63.07,0l0,0.01z" fill="#f4e70f" stroke="black"/>
<text class="ges_letter_big" x="80" y="124" stroke="black">D</text>
${generateValueBox(energyValue, gesValue, VALUE_BOX_TRANSFORMS.D)}`
}

function generateSelectedE(energyValue: number, gesValue: number): string {
  return `<path d="m74.69,160.99l0,-27.71l71.44,0l9.45,13.85l-9.45,13.85l-71.44,0l0,0.01z" fill="#f0b40f" stroke="black"/>
<text class="ges_letter_big" x="80" y="153">E</text>
${generateValueBox(energyValue, gesValue, VALUE_BOX_TRANSFORMS.E)}`
}

function generateSelectedF(energyValue: number, gesValue: number): string {
  return `<path d="m74.69,176.99l0,-27.71l82.34,0l9.45,13.85l-9.45,13.85l-82.34,0l0,0.01z" fill="#eb8235" stroke="black"/>
<text class="ges_letter_big" x="80" y="169">F</text>
${generateValueBox(energyValue, gesValue, VALUE_BOX_TRANSFORMS.F)}`
}

function generateSelectedG(energyValue: number, gesValue: number): string {
  return `<path d="m74.69,192.99l0,-27.71l93.64,0l9.45,13.85l-9.45,13.85l-93.64,0l0,0.01z" fill="#d7221f" stroke="black"/>
<text class="ges_letter_big" x="80" y="185">G</text>
${generateValueBox(energyValue, gesValue, VALUE_BOX_TRANSFORMS.G)}`
}

export default generateDpeSvg
