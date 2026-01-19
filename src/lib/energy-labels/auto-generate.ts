/**
 * Auto-generate DPE and GES labels for a property
 * This module provides a function to automatically generate and upload energy labels
 * when a property is created or updated with energy data
 */

import { generateDpeSvg, generateGesSvg, type DpeClass, type GesClass } from './index'
import { uploadToStorage, BUCKETS } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'

interface GenerateLabelsOptions {
  propertyId: string
  reference: string
  energyValue: number
  energyClass: string
  gesValue: number
  gesClass: string
}

interface GenerateLabelsResult {
  success: boolean
  dpeImageUrl?: string
  gesImageUrl?: string
  error?: string
}

/**
 * Auto-generate DPE and GES labels for a property
 * Generates SVG images and uploads them to Supabase storage
 * 
 * @param options - The property data needed for label generation
 * @returns Result object with URLs or error
 */
export async function autoGenerateEnergyLabels(
  options: GenerateLabelsOptions
): Promise<GenerateLabelsResult> {
  const { propertyId, reference, energyValue, energyClass, gesValue, gesClass } = options

  try {
    // Validate energy class values
    const validClasses = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
    const normalizedEnergyClass = energyClass.toUpperCase()
    const normalizedGesClass = gesClass.toUpperCase()

    if (!validClasses.includes(normalizedEnergyClass)) {
      return {
        success: false,
        error: `Classe DPE invalide: ${energyClass}. Valeurs acceptées: A, B, C, D, E, F, G`,
      }
    }

    if (!validClasses.includes(normalizedGesClass)) {
      return {
        success: false,
        error: `Classe GES invalide: ${gesClass}. Valeurs acceptées: A, B, C, D, E, F, G`,
      }
    }

    // Generate DPE SVG
    console.log(`[Auto-generate] Generating DPE label for ${reference}: Class ${normalizedEnergyClass}, Value ${energyValue} kWh/m²/an`)
    const dpeSvg = generateDpeSvg(
      energyValue,
      normalizedEnergyClass as DpeClass,
      gesValue
    )
    const dpeBuffer = Buffer.from(dpeSvg, 'utf-8')

    // Generate GES SVG
    console.log(`[Auto-generate] Generating GES label for ${reference}: Class ${normalizedGesClass}, Value ${gesValue} kg CO₂/m²/an`)
    const gesSvg = generateGesSvg(
      gesValue,
      normalizedGesClass as GesClass
    )
    const gesBuffer = Buffer.from(gesSvg, 'utf-8')

    // Generate unique filenames with timestamp
    const timestamp = Date.now()
    // Stocker dans property-files/{reference}/file/
    const dpeFileName = `${reference}/file/${reference}_dpe_${timestamp}.svg`
    const gesFileName = `${reference}/file/${reference}_ges_${timestamp}.svg`

    console.log(`[Auto-generate] Uploading DPE image: ${dpeFileName} (${dpeBuffer.length} bytes)`)
    console.log(`[Auto-generate] Uploading GES image: ${gesFileName} (${gesBuffer.length} bytes)`)

    // Upload DPE image to 'property-files' bucket
    const { url: dpeUrl, error: dpeError } = await uploadToStorage(
      BUCKETS.PROPERTY_FILES,
      dpeFileName,
      dpeBuffer,
      'image/svg+xml'
    )

    if (dpeError || !dpeUrl) {
      console.error("[Auto-generate] Error uploading DPE image:", dpeError)
      return {
        success: false,
        error: "Erreur lors de l'upload de l'image DPE dans Supabase Storage",
      }
    }

    console.log(`[Auto-generate] DPE image uploaded successfully: ${dpeUrl}`)

    // Upload GES image to 'property-files' bucket
    const { url: gesUrl, error: gesError } = await uploadToStorage(
      BUCKETS.PROPERTY_FILES,
      gesFileName,
      gesBuffer,
      'image/svg+xml'
    )

    if (gesError || !gesUrl) {
      console.error("[Auto-generate] Error uploading GES image:", gesError)
      return {
        success: false,
        error: "Erreur lors de l'upload de l'image GES dans Supabase Storage",
      }
    }

    console.log(`[Auto-generate] GES image uploaded successfully: ${gesUrl}`)

    // Update property energy data with the generated URLs
    const existingEnergy = await prisma.propertyEnergy.findUnique({
      where: { propertyId },
    })

    if (existingEnergy) {
      await prisma.propertyEnergy.update({
        where: { propertyId },
        data: {
          dpeImageUrl: dpeUrl,
          gesImageUrl: gesUrl,
          energyValue,
          energyClass: normalizedEnergyClass,
          gesValue,
          gesClass: normalizedGesClass,
          labelGenerated: true,
          labelGeneratedAt: new Date(),
        },
      })
    } else {
      await prisma.propertyEnergy.create({
        data: {
          propertyId,
          dpeImageUrl: dpeUrl,
          gesImageUrl: gesUrl,
          energyValue,
          energyClass: normalizedEnergyClass,
          gesValue,
          gesClass: normalizedGesClass,
          labelGenerated: true,
          labelGeneratedAt: new Date(),
        },
      })
    }

    console.log(`[Auto-generate] Energy labels generated successfully for property ${reference}`)

    return {
      success: true,
      dpeImageUrl: dpeUrl,
      gesImageUrl: gesUrl,
    }
  } catch (error) {
    console.error("[Auto-generate] Error generating energy labels:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue lors de la génération des étiquettes énergie",
    }
  }
}

