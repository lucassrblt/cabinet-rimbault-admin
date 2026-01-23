import { NextResponse } from "next/server"
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
 * Generate DPE/GES labels for preview (works without propertyId).
 * Returns data URLs only — no storage upload. Actual upload happens on form submit via autoGenerateEnergyLabels.
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

    // Generate DPE SVG locally (preview only — no upload)
    console.log(`Generating DPE label preview: Class ${normalizedEnergyClass}, Value ${energyValue} kWh/m²/an`)
    const dpeSvg = generateDpeSvg(
      energyValue,
      normalizedEnergyClass as DpeClass,
      gesValue
    )

    // Generate GES SVG locally (preview only — no upload)
    console.log(`Generating GES label preview: Class ${normalizedGesClass}, Value ${gesValue} kg CO₂/m²/an`)
    const gesSvg = generateGesSvg(
      gesValue,
      normalizedGesClass as GesClass
    )

    // Return data URLs for preview; storage happens on submit via autoGenerateEnergyLabels
    const dpeBase64 = Buffer.from(dpeSvg, 'utf-8').toString('base64')
    const gesBase64 = Buffer.from(gesSvg, 'utf-8').toString('base64')
    const dpeImageUrl = `data:image/svg+xml;base64,${dpeBase64}`
    const gesImageUrl = `data:image/svg+xml;base64,${gesBase64}`

    return NextResponse.json({
      success: true,
      preview: {
        dpeImageUrl,
        gesImageUrl,
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

