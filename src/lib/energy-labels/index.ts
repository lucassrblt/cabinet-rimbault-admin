/**
 * Energy Labels Generators
 * 
 * This module provides functions to generate official French DPE and GES labels
 * as SVG images. These are used for energy performance diagnostics.
 * 
 * Based on the official 2021 model (modèle 2021)
 */

export { generateDpeSvg, type DpeClass } from './generate-dpe'
export { generateGesSvg, type GesClass } from './generate-ges'
export { autoGenerateEnergyLabels } from './auto-generate'

// Type for valid energy classes
export type EnergyClass = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'

/**
 * Validate if a string is a valid energy class
 */
export function isValidEnergyClass(value: string): value is EnergyClass {
  return ['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(value.toUpperCase())
}

/**
 * Get DPE class based on energy value (kWh/m²/an)
 * Based on official 2021 thresholds
 */
export function getDpeClassFromValue(value: number): EnergyClass {
  if (value <= 70) return 'A'
  if (value <= 110) return 'B'
  if (value <= 180) return 'C'
  if (value <= 250) return 'D'
  if (value <= 330) return 'E'
  if (value <= 420) return 'F'
  return 'G'
}

/**
 * Get GES class based on CO2 emissions value (kg CO₂/m²/an)
 * Based on official 2021 thresholds
 */
export function getGesClassFromValue(value: number): EnergyClass {
  if (value <= 6) return 'A'
  if (value <= 11) return 'B'
  if (value <= 30) return 'C'
  if (value <= 50) return 'D'
  if (value <= 70) return 'E'
  if (value <= 100) return 'F'
  return 'G'
}

