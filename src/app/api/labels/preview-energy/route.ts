import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { uploadToStorage, BUCKETS } from "@/lib/supabase"
import { requireAuth } from "@/lib/api-auth"
import { generateDpeSvg, generateGesSvg, type DpeClass, type GesClass } from "@/lib/energy-labels"

interface PreviewEnergyRequest {
  propertyId: string
  energyValue?: number
  energyClass?: string
  gesValue?: number
  gesClass?: string
}

/**
 * POST /api/labels/preview-energy
 * Preview DPE/GES images before generating the final label
 * Generates SVG labels locally and stores them in the 'files' bucket
 */
export async function POST(request: Request) {
  // Vérification de l'authentification
  const authResult = await requireAuth()
  if (!authResult.authenticated) {
    return authResult.response
  }

  try {
    const body: PreviewEnergyRequest = await request.json()
    const { propertyId, energyValue, energyClass, gesValue, gesClass } = body

    // Fetch property with energy data
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        energy: true,
      },
    })

    if (!property) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 }
      )
    }

    // Use provided values or fallback to property energy values
    const finalEnergyValue = energyValue ?? property.energy?.energyValue
    const finalEnergyClass = energyClass ?? property.energy?.energyClass
    const finalGesValue = gesValue ?? property.energy?.gesValue
    const finalGesClass = gesClass ?? property.energy?.gesClass

    // Validate DPE and GES data
    if (!finalEnergyClass || !finalEnergyValue) {
      return NextResponse.json(
        { error: "Les données DPE (classe et valeur) sont requises" },
        { status: 400 }
      )
    }

    if (!finalGesClass || !finalGesValue) {
      return NextResponse.json(
        { error: "Les données GES (classe et valeur) sont requises" },
        { status: 400 }
      )
    }

    // Validate class values
    const validClasses = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
    const normalizedEnergyClass = finalEnergyClass.toUpperCase()
    const normalizedGesClass = finalGesClass.toUpperCase()

    if (!validClasses.includes(normalizedEnergyClass)) {
      return NextResponse.json(
        { error: `Classe DPE invalide: ${finalEnergyClass}. Valeurs acceptées: A, B, C, D, E, F, G` },
        { status: 400 }
      )
    }

    if (!validClasses.includes(normalizedGesClass)) {
      return NextResponse.json(
        { error: `Classe GES invalide: ${finalGesClass}. Valeurs acceptées: A, B, C, D, E, F, G` },
        { status: 400 }
      )
    }

    // Generate DPE SVG locally
    console.log(`Generating DPE label: Class ${normalizedEnergyClass}, Value ${finalEnergyValue} kWh/m²/an`)
    const dpeSvg = generateDpeSvg(
      finalEnergyValue,
      normalizedEnergyClass as DpeClass,
      finalGesValue
    )
    const dpeBuffer = Buffer.from(dpeSvg, 'utf-8')

    // Generate GES SVG locally
    console.log(`Generating GES label: Class ${normalizedGesClass}, Value ${finalGesValue} kg CO₂/m²/an`)
    const gesSvg = generateGesSvg(
      finalGesValue,
      normalizedGesClass as GesClass
    )
    const gesBuffer = Buffer.from(gesSvg, 'utf-8')

    // Generate unique filenames with timestamp
    const timestamp = Date.now()
    const dpeFileName = `files/${property.reference}/dpe/${property.reference}_dpe_${timestamp}.svg`
    const gesFileName = `files/${property.reference}/ges/${property.reference}_ges_${timestamp}.svg`

    console.log(`Uploading DPE image: ${dpeFileName} (${dpeBuffer.length} bytes)`)
    console.log(`Uploading GES image: ${gesFileName} (${gesBuffer.length} bytes)`)

    // Upload DPE image to 'files' bucket
    const { url: dpeUrl, error: dpeError } = await uploadToStorage(
      BUCKETS.FILES,
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

    // Upload GES image to 'files' bucket
    const { url: gesUrl, error: gesError } = await uploadToStorage(
      BUCKETS.FILES,
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
        energyValue: finalEnergyValue,
        energyClass: normalizedEnergyClass,
        gesValue: finalGesValue,
        gesClass: normalizedGesClass,
      },
      property: {
        id: property.id,
        reference: property.reference,
        title: property.title,
      },
    })
  } catch (error) {
    console.error("Error previewing energy labels:", error)
    return NextResponse.json(
      { error: "Erreur lors de la prévisualisation des étiquettes énergie" },
      { status: 500 }
    )
  }
}
