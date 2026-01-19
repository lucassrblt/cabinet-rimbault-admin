import { NextResponse } from "next/server"
import { uploadToStorage, BUCKETS } from "@/lib/supabase"
import { requireAuth } from "@/lib/api-auth"
import { generateDpeSvg, generateGesSvg, type DpeClass, type GesClass } from "@/lib/energy-labels"

interface GeneratePreviewRequest {
  reference: string
  energyValue: number
  energyClass: string
  gesValue: number
  gesClass: string
}

/**
 * POST /api/labels/generate-preview
 * Generate DPE/GES labels for preview (works without propertyId)
 * Generates SVG labels locally and stores them in the 'property-files' bucket under [reference]/labels/
 */
export async function POST(request: Request) {
  // Vérification de l'authentification
  const authResult = await requireAuth()
  if (!authResult.authenticated) {
    return authResult.response
  }

  try {
    const body: GeneratePreviewRequest = await request.json()
    const { reference, energyValue, energyClass, gesValue, gesClass } = body

    // Validate DPE and GES data
    if (!energyClass || !energyValue) {
      return NextResponse.json(
        { error: "Les données DPE (classe et valeur) sont requises" },
        { status: 400 }
      )
    }

    if (!gesClass || !gesValue) {
      return NextResponse.json(
        { error: "Les données GES (classe et valeur) sont requises" },
        { status: 400 }
      )
    }

    if (!reference) {
      return NextResponse.json(
        { error: "La référence de la propriété est requise" },
        { status: 400 }
      )
    }

    // Validate class values
    const validClasses = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
    const normalizedEnergyClass = energyClass.toUpperCase()
    const normalizedGesClass = gesClass.toUpperCase()

    if (!validClasses.includes(normalizedEnergyClass)) {
      return NextResponse.json(
        { error: `Classe DPE invalide: ${energyClass}. Valeurs acceptées: A, B, C, D, E, F, G` },
        { status: 400 }
      )
    }

    if (!validClasses.includes(normalizedGesClass)) {
      return NextResponse.json(
        { error: `Classe GES invalide: ${gesClass}. Valeurs acceptées: A, B, C, D, E, F, G` },
        { status: 400 }
      )
    }

    // Generate DPE SVG locally
    console.log(`Generating DPE label preview: Class ${normalizedEnergyClass}, Value ${energyValue} kWh/m²/an`)
    const dpeSvg = generateDpeSvg(
      energyValue,
      normalizedEnergyClass as DpeClass,
      gesValue
    )
    const dpeBuffer = Buffer.from(dpeSvg, 'utf-8')

    // Generate GES SVG locally
    console.log(`Generating GES label preview: Class ${normalizedGesClass}, Value ${gesValue} kg CO₂/m²/an`)
    const gesSvg = generateGesSvg(
      gesValue,
      normalizedGesClass as GesClass
    )
    const gesBuffer = Buffer.from(gesSvg, 'utf-8')

    // Generate unique filenames with timestamp in property-files/[reference]/labels/
    const timestamp = Date.now()
    const dpeFileName = `${reference}/labels/${reference}_dpe_${timestamp}.svg`
    const gesFileName = `${reference}/labels/${reference}_ges_${timestamp}.svg`

    console.log(`Uploading DPE image: ${dpeFileName} (${dpeBuffer.length} bytes)`)
    console.log(`Uploading GES image: ${gesFileName} (${gesBuffer.length} bytes)`)

    // Upload DPE image to 'property-files' bucket in labels folder
    const { url: dpeUrl, error: dpeError } = await uploadToStorage(
      BUCKETS.PROPERTY_FILES,
      dpeFileName,
      dpeBuffer,
      'image/svg+xml'
    )

    if (dpeError) {
      console.error("Error uploading DPE image:", dpeError)
      return NextResponse.json(
        { error: "Erreur lors de l'upload de l'image DPE dans Supabase Storage" },
        { status: 500 }
      )
    }

    console.log(`DPE image uploaded successfully: ${dpeUrl}`)

    // Upload GES image to 'property-files' bucket in labels folder
    const { url: gesUrl, error: gesError } = await uploadToStorage(
      BUCKETS.PROPERTY_FILES,
      gesFileName,
      gesBuffer,
      'image/svg+xml'
    )

    if (gesError) {
      console.error("Error uploading GES image:", gesError)
      return NextResponse.json(
        { error: "Erreur lors de l'upload de l'image GES dans Supabase Storage" },
        { status: 500 }
      )
    }

    console.log(`GES image uploaded successfully: ${gesUrl}`)

    // Return preview data with URLs
    return NextResponse.json({
      success: true,
      preview: {
        dpeImageUrl: dpeUrl,
        gesImageUrl: gesUrl,
        energyValue,
        energyClass: normalizedEnergyClass,
        gesValue,
        gesClass: normalizedGesClass,
      },
    })
  } catch (error) {
    console.error("Error generating preview labels:", error)
    return NextResponse.json(
      { error: "Erreur lors de la génération des étiquettes énergie" },
      { status: 500 }
    )
  }
}

