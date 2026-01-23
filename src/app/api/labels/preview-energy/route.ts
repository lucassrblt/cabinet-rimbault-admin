import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
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
 * Preview DPE/GES images before generating the final label.
 * Returns data URLs only — no storage upload.
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

    // Generate DPE SVG locally (preview only — no upload)
    console.log(`Generating DPE label: Class ${normalizedEnergyClass}, Value ${finalEnergyValue} kWh/m²/an`)
    const dpeSvg = generateDpeSvg(
      finalEnergyValue,
      normalizedEnergyClass as DpeClass,
      finalGesValue
    )

    // Generate GES SVG locally (preview only — no upload)
    console.log(`Generating GES label: Class ${normalizedGesClass}, Value ${finalGesValue} kg CO₂/m²/an`)
    const gesSvg = generateGesSvg(
      finalGesValue,
      normalizedGesClass as GesClass
    )

    // Return data URLs for preview; no storage upload
    const dpeBase64 = Buffer.from(dpeSvg, 'utf-8').toString('base64')
    const gesBase64 = Buffer.from(gesSvg, 'utf-8').toString('base64')
    const dpeImageUrl = `data:image/svg+xml;base64,${dpeBase64}`
    const gesImageUrl = `data:image/svg+xml;base64,${gesBase64}`

    return NextResponse.json({
      success: true,
      preview: {
        dpeImageUrl,
        gesImageUrl,
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
