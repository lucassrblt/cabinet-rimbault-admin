import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { uploadToStorage, BUCKETS } from "@/lib/supabase"
import { requireAuth } from "@/lib/api-auth"

interface PreviewEnergyRequest {
  propertyId: string
  energyValue?: number
  energyClass?: string
  gesValue?: number
  gesClass?: string
}

interface EnergyImageResult {
  buffer: Buffer
  contentType: string
}

/**
 * Fetch DPE or GES image from outils.immo API
 */
async function fetchEnergyImage(
  type: "dpe" | "ges",
  value: number,
  letter: string
): Promise<EnergyImageResult> {
  const modele = "2021"
  const apiUrl = `https://www.outils.immo/outils-immo.php?type=${type}&modele=${modele}&valeur=${value}&lettre=${letter.toLowerCase()}`

  console.log(`Fetching ${type} image from: ${apiUrl}`)

  // Créer un objet Headers explicite pour s'assurer que les headers sont bien passés
  const headers = new Headers()
  headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
  headers.set('Referer', 'https://www.outils.immo/')
  headers.set('Accept', 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8')
  headers.set('Accept-Language', 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7')
  headers.set('Origin', 'https://www.outils.immo')
  
  // Log des headers pour le débogage
  console.log(`Headers for ${type} request:`, Object.fromEntries(headers.entries()))

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: headers,
    // Désactiver le cache pour éviter les problèmes
    cache: 'no-store',
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText)
    console.error(`Error response for ${type}:`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: errorText,
    })
    throw new Error(`Erreur API outils.immo: ${response.status} ${response.statusText}`)
  }

  // Récupérer l'image
  const imageBuffer = await response.arrayBuffer()
  const contentType = response.headers.get('content-type') || 'image/png'

  console.log(`${type} image fetched: ${imageBuffer.byteLength} bytes, content-type: ${contentType}`)

  if (imageBuffer.byteLength === 0) {
    throw new Error(`Image ${type} vide reçue de l'API`)
  }

  // Convertir ArrayBuffer en Buffer Node.js pour l'upload
  return {
    buffer: Buffer.from(imageBuffer),
    contentType,
  }
}

/**
 * POST /api/labels/preview-energy
 * Preview DPE/GES images before generating the final label
 * Stores images in the 'files' bucket
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

    // Fetch DPE and GES images from external API
    let dpeImage: EnergyImageResult
    let gesImage: EnergyImageResult

    try {
      dpeImage = await fetchEnergyImage("dpe", finalEnergyValue, finalEnergyClass)
    } catch (error) {
      console.error("Error fetching DPE image:", error)
      return NextResponse.json(
        { error: `Impossible de récupérer l'image DPE: ${error instanceof Error ? error.message : 'Erreur inconnue'}` },
        { status: 500 }
      )
    }

    try {
      gesImage = await fetchEnergyImage("ges", finalGesValue, finalGesClass)
    } catch (error) {
      console.error("Error fetching GES image:", error)
      return NextResponse.json(
        { error: `Impossible de récupérer l'image GES: ${error instanceof Error ? error.message : 'Erreur inconnue'}` },
        { status: 500 }
      )
    }

    // Generate unique filenames with timestamp
    const timestamp = Date.now()
    // Déterminer l'extension à partir du content-type
    const dpeExtension = dpeImage.contentType.includes('svg') ? 'svg' : 'png'
    const gesExtension = gesImage.contentType.includes('svg') ? 'svg' : 'png'
    const dpeFileName = `dpe/${property.reference}_dpe_${timestamp}.${dpeExtension}`
    const gesFileName = `ges/${property.reference}_ges_${timestamp}.${gesExtension}`

    console.log(`Uploading DPE image: ${dpeFileName} (${dpeImage.buffer.length} bytes)`)
    console.log(`Uploading GES image: ${gesFileName} (${gesImage.buffer.length} bytes)`)

    // Upload DPE image to 'files' bucket
    const { url: dpeUrl, error: dpeError } = await uploadToStorage(
      BUCKETS.FILES,
      dpeFileName,
      dpeImage.buffer,
      dpeImage.contentType
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
      gesImage.buffer,
      gesImage.contentType
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
        energyClass: finalEnergyClass,
        gesValue: finalGesValue,
        gesClass: finalGesClass,
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
