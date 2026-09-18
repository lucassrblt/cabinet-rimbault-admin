import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { buildEnergyPreview } from "@/lib/energy-labels/preview"
import { prisma } from "@/lib/prisma"

interface PreviewEnergyRequest {
  /**
   * Optionnel : quand il est fourni, les valeurs absentes du corps de la
   * requête sont reprises depuis les données énergie du bien. Sans lui, la
   * route fonctionne à la création d'un bien, avant qu'il n'existe en base.
   */
  propertyId?: string
  energyValue?: number
  energyClass?: string
  gesValue?: number
  gesClass?: string
  /** Énergie finale : facultative, la ligne est omise de l'étiquette si absente. */
  finalEnergyValue?: number | null
}

/**
 * POST /api/labels/preview-energy
 * Aperçu des étiquettes DPE/GES avant génération définitive.
 * Renvoie des data URLs — aucun upload dans le storage.
 */
export async function POST(request: Request) {
  // Vérification de l'authentification
  const authResult = await requireAuth()
  if (!authResult.authenticated) {
    return authResult.response
  }

  try {
    const body: PreviewEnergyRequest = await request.json()
    const {
      propertyId,
      energyValue,
      energyClass,
      gesValue,
      gesClass,
      finalEnergyValue,
    } = body

    let property: {
      id: string
      reference: string
      title: string
      energy: {
        energyValue: number | null
        energyClass: string | null
        gesValue: number | null
        gesClass: string | null
        finalEnergyValue: number | null
      } | null
    } | null = null

    if (propertyId) {
      property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: { energy: true },
      })

      if (!property) {
        return NextResponse.json({ error: "Annonce non trouvée" }, { status: 404 })
      }
    }

    // Valeurs fournies, sinon repli sur celles du bien
    const result = buildEnergyPreview({
      energyValue: energyValue ?? property?.energy?.energyValue,
      energyClass: energyClass ?? property?.energy?.energyClass,
      gesValue: gesValue ?? property?.energy?.gesValue,
      gesClass: gesClass ?? property?.energy?.gesClass,
      finalEnergyValue:
        finalEnergyValue ?? property?.energy?.finalEnergyValue ?? null,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    console.log(
      `[Preview] Étiquettes DPE ${result.preview.energyClass} (${result.preview.energyValue} kWh/m²/an) et GES ${result.preview.gesClass} (${result.preview.gesValue} kg CO₂/m²/an)`,
    )

    return NextResponse.json({
      success: true,
      preview: result.preview,
      ...(property
        ? {
            property: {
              id: property.id,
              reference: property.reference,
              title: property.title,
            },
          }
        : {}),
    })
  } catch (error) {
    console.error("Error previewing energy labels:", error)
    return NextResponse.json(
      { error: "Erreur lors de la prévisualisation des étiquettes énergie" },
      { status: 500 },
    )
  }
}
