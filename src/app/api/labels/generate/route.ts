import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { uploadToStorage, BUCKETS } from "@/lib/supabase"
import { requireAuth } from "@/lib/api-auth"

interface GenerateLabelRequest {
  propertyId: string
  selectedPhotoIds?: string[]  // Array of selected photo IDs in order
  selectedImageIndex?: number  // Deprecated, for backwards compatibility
  primaryColor: string
  // Optional: use pre-generated energy images
  previewDpeUrl?: string
  previewGesUrl?: string
  // Optional: updated energy values
  energyValue?: number
  energyClass?: string
  gesValue?: number
  gesClass?: string
}

/**
 * Fetch DPE or GES image from outils.immo API
 */
async function fetchEnergyImage(
  type: "dpe" | "ges",
  value: number,
  letter: string
): Promise<ArrayBuffer | null> {
  const modele = "2021"
  const apiUrl = `https://www.outils.immo/outils-immo.php?type=${type}&modele=${modele}&valeur=${value}&lettre=${letter.toLowerCase()}`

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.outils.immo/',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    })
    if (!response.ok) {
      console.error(`Failed to fetch ${type} image:`, response.statusText)
      return null
    }
    return await response.arrayBuffer()
  } catch (error) {
    console.error(`Error fetching ${type} image:`, error)
    return null
  }
}

export async function POST(request: Request) {
  // Vérification de l'authentification
  const authResult = await requireAuth()
  if (!authResult.authenticated) {
    return authResult.response
  }

  try {
    const body: GenerateLabelRequest = await request.json()
    const { 
      propertyId, 
      selectedPhotoIds,
      selectedImageIndex, // Deprecated, for backwards compatibility
      primaryColor,
      previewDpeUrl,
      previewGesUrl,
      energyValue: customEnergyValue,
      energyClass: customEnergyClass,
      gesValue: customGesValue,
      gesClass: customGesClass,
    } = body

    // Fetch property with images and energy data
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        energy: true,
        finance: true,
        location: true,
        characteristics: true,
      },
    })

    if (!property) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 }
      )
    }

    // Use custom values if provided, otherwise use property energy values
    const finalEnergyValue = customEnergyValue ?? property.energy?.energyValue
    const finalEnergyClass = customEnergyClass ?? property.energy?.energyClass
    const finalGesValue = customGesValue ?? property.energy?.gesValue
    const finalGesClass = customGesClass ?? property.energy?.gesClass

    // Validate DPE and GES data
    if (!finalEnergyClass || !finalEnergyValue) {
      return NextResponse.json(
        { error: "Les données DPE sont requises pour générer l'étiquette" },
        { status: 400 }
      )
    }

    if (!finalGesClass || !finalGesValue) {
      return NextResponse.json(
        { error: "Les données GES sont requises pour générer l'étiquette" },
        { status: 400 }
      )
    }

    let dpeUrl = previewDpeUrl
    let gesUrl = previewGesUrl

    // If no preview URLs provided, fetch fresh images
    if (!dpeUrl || !gesUrl) {
      // Fetch DPE image
      const dpeImageBuffer = await fetchEnergyImage(
        "dpe",
        finalEnergyValue,
        finalEnergyClass
      )

      // Fetch GES image
      const gesImageBuffer = await fetchEnergyImage(
        "ges",
        finalGesValue,
        finalGesClass
      )

      if (!dpeImageBuffer || !gesImageBuffer) {
        return NextResponse.json(
          { error: "Impossible de récupérer les images DPE/GES" },
          { status: 500 }
        )
      }

      // Upload DPE image to FILES bucket
      const dpeFileName = `${property.reference}_dpe_${Date.now()}.png`
      const { url: uploadedDpeUrl, error: dpeError } = await uploadToStorage(
        BUCKETS.FILES,
        dpeFileName,
        dpeImageBuffer,
        "image/png"
      )

      if (dpeError) {
        console.error("Error uploading DPE image:", dpeError)
      }
      dpeUrl = uploadedDpeUrl

      // Upload GES image to FILES bucket
      const gesFileName = `${property.reference}_ges_${Date.now()}.png`
      const { url: uploadedGesUrl, error: gesError } = await uploadToStorage(
        BUCKETS.FILES,
        gesFileName,
        gesImageBuffer,
        "image/png"
      )

      if (gesError) {
        console.error("Error uploading GES image:", gesError)
      }
      gesUrl = uploadedGesUrl
    }

    // Get selected photos
    let selectedPhotos: { id: string; url: string; alt?: string | null }[] = []
    
    if (selectedPhotoIds && selectedPhotoIds.length > 0) {
      // Use new selectedPhotoIds array
      selectedPhotos = selectedPhotoIds
        .map((id) => property.images.find((img) => img.id === id))
        .filter((img): img is typeof property.images[0] => img !== undefined)
        .map((img) => ({ id: img.id, url: img.url, alt: img.alt }))
    } else if (selectedImageIndex !== undefined) {
      // Backwards compatibility: use selectedImageIndex
      const selectedImage = property.images[selectedImageIndex] || property.images[0]
      if (selectedImage) {
        selectedPhotos = [{ id: selectedImage.id, url: selectedImage.url, alt: selectedImage.alt }]
      }
    }

    // Update property energy data with DPE/GES image URLs and label info
    if (property.energy) {
      await prisma.propertyEnergy.update({
        where: { propertyId: propertyId },
        data: {
          dpeImageUrl: dpeUrl,
          gesImageUrl: gesUrl,
          energyValue: finalEnergyValue,
          energyClass: finalEnergyClass,
          gesValue: finalGesValue,
          gesClass: finalGesClass,
          labelGenerated: true,
          labelGeneratedAt: new Date(),
          labelColor: primaryColor,
        },
      })
    } else {
      await prisma.propertyEnergy.create({
        data: {
          propertyId: propertyId,
          dpeImageUrl: dpeUrl,
          gesImageUrl: gesUrl,
          energyValue: finalEnergyValue,
          energyClass: finalEnergyClass,
          gesValue: finalGesValue,
          gesClass: finalGesClass,
          labelGenerated: true,
          labelGeneratedAt: new Date(),
          labelColor: primaryColor,
        },
      })
    }

    // Fetch updated property
    const updatedProperty = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        energy: true,
        finance: true,
        location: true,
        characteristics: true,
      },
    })

    // Return label data for PDF generation on client
    // The client will generate the PDF and call the upload-pdf endpoint
    return NextResponse.json({
      success: true,
      property: updatedProperty,
      labelData: {
        dpeImageUrl: dpeUrl,
        gesImageUrl: gesUrl,
        selectedPhotos,
        primaryColor,
      },
    })
  } catch (error) {
    console.error("Error generating label:", error)
    return NextResponse.json(
      { error: "Erreur lors de la génération de l'étiquette" },
      { status: 500 }
    )
  }
}
