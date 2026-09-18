/**
 * Energy Labels Generators
 *
 * This module provides functions to generate official French DPE and GES labels
 * as SVG images. These are used for energy performance diagnostics.
 *
 * Based on the official 2021 model (modèle 2021).
 *
 * L'échelle elle-même (couleurs, seuils, bornes) vit dans `./scale` — source de
 * vérité unique, à ne jamais redupliquer.
 */

export { generateDpeSvg, type DpeClass } from './generate-dpe'
export { generateGesSvg, type GesClass } from './generate-ges'
export { autoGenerateEnergyLabels } from './auto-generate'

export {
  type EnergyClass,
  ENERGY_CLASSES,
  CLASS_INDEX,
  DPE_COLORS,
  GES_COLORS,
  DPE_TEXT_COLORS,
  GES_TEXT_COLORS,
  DPE_TAILWIND,
  GES_TAILWIND,
  LABEL_INK,
  DPE_THRESHOLDS,
  GES_THRESHOLDS,
  DPE_BOUNDS_LABEL,
  GES_BOUNDS_LABEL,
  PASSOIRE_CLASSES,
  isValidEnergyClass,
  getDpeClassFromValue,
  getGesClassFromValue,
  isPassoireEnergetique,
} from './scale'
