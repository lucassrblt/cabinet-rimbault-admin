import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-auth"
import { deleteFromStorage, BUCKETS } from "@/lib/supabase"

// Augmenter le timeout pour les opérations multiples (60 secondes)
export const maxDuration = 60
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST /api/properties/[id]/images - Créer les entrées en base après upload direct
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth()
  if (!authResult.authenticated) {
    return authResult.response
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { images } = body

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "Aucune image fournie" },
        { status: 400 }
      )
    }

    // Vérifier que la propriété existe
    const property = await prisma.property.findUnique({
      where: { id },
      include: { images: true },
    })

    if (!property) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 }
      )
    }

    const existingImagesCount = property.images.length
    const startOrder = existingImagesCount

    // Limiter à 20 images total
    const maxNewImages = 20 - existingImagesCount
    const imagesToCreate = images.slice(0, maxNewImages)

    if (imagesToCreate.length < images.length) {
      console.warn(
        `Limite de 20 images atteinte. ${images.length - imagesToCreate.length} images ignorées.`
      )
    }

    // Créer les entrées en base de données
    interface ImageInput {
      url: string
      alt?: string
      filename?: string
      size?: number
    }
    const createdImages = await Promise.all(
      imagesToCreate.map((img: ImageInput, index: number) =>
        prisma.propertyImage.create({
          data: {
            url: img.url,
            alt: img.alt || img.filename?.replace(/\.[^/.]+$/, "") || "",
            order: startOrder + index,
            isMain: existingImagesCount === 0 && index === 0,
            propertyId: id,
            size: img.size || 0,
          },
        })
      )
    )

    return NextResponse.json({
      success: true,
      uploaded: createdImages.length,
      images: createdImages,
    })
  } catch (error) {
    console.error("Error creating image records:", error)
    return NextResponse.json(
      {
        error: "Erreur lors de la création des images",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    )
  }
}

// GET /api/properties/[id]/images - Récupérer les images d'une propriété
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth()
  if (!authResult.authenticated) {
    return authResult.response
  }

  try {
    const { id } = await params

    const images = await prisma.propertyImage.findMany({
      where: { propertyId: id },
      orderBy: { order: "asc" },
    })

    return NextResponse.json(images)
  } catch (error) {
    console.error("Error fetching images:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des images" },
      { status: 500 }
    )
  }
}

// DELETE /api/properties/[id]/images - Supprimer une image
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth()
  if (!authResult.authenticated) {
    return authResult.response
  }

  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get("imageId")

    if (!imageId) {
      return NextResponse.json(
        { error: "ID de l'image requis" },
        { status: 400 }
      )
    }

    // Récupérer l'image
    const image = await prisma.propertyImage.findUnique({
      where: { id: imageId },
    })

    if (!image || image.propertyId !== id) {
      return NextResponse.json(
        { error: "Image non trouvée" },
        { status: 404 }
      )
    }

    // Extraire le chemin du fichier depuis l'URL
    // Support des deux buckets (ancien et nouveau) pour compatibilité
    let filePath: string | null = null
    let bucket: string = BUCKETS.PROPERTY_FILES
    
    if (image.url.includes(BUCKETS.PROPERTY_FILES)) {
      const urlParts = image.url.split(`${BUCKETS.PROPERTY_FILES}/`)
      if (urlParts.length > 1) {
        filePath = urlParts[1].split('?')[0]
        bucket = BUCKETS.PROPERTY_FILES
      }
    } else if (image.url.includes(BUCKETS.PROPERTY_IMAGES)) {
      const urlParts = image.url.split(`${BUCKETS.PROPERTY_IMAGES}/`)
      if (urlParts.length > 1) {
        filePath = urlParts[1].split('?')[0]
        bucket = BUCKETS.PROPERTY_IMAGES
      }
    }
    
    if (filePath) {
      // Supprimer le fichier de Supabase
      const deleteResult = await deleteFromStorage(bucket, filePath)
      if (!deleteResult.success && deleteResult.error) {
        console.error(`Erreur suppression fichier ${filePath}:`, deleteResult.error)
      }
    }

    // Supprimer l'entrée en base de données
    await prisma.propertyImage.delete({
      where: { id: imageId },
    })

    // Si c'était l'image principale, définir la première image restante comme principale
    if (image.isMain) {
      const remainingImages = await prisma.propertyImage.findMany({
        where: { propertyId: id },
        orderBy: { order: "asc" },
        take: 1,
      })

      if (remainingImages.length > 0) {
        await prisma.propertyImage.update({
          where: { id: remainingImages[0].id },
          data: { isMain: true },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting image:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'image" },
      { status: 500 }
    )
  }
}

// PATCH /api/properties/[id]/images - Mettre à jour l'ordre ou l'image principale
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth()
  if (!authResult.authenticated) {
    return authResult.response
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { imageId, isMain, order } = body

    if (!imageId) {
      return NextResponse.json(
        { error: "ID de l'image requis" },
        { status: 400 }
      )
    }

    // Vérifier que l'image existe et appartient à cette propriété
    const image = await prisma.propertyImage.findUnique({
      where: { id: imageId },
    })

    if (!image || image.propertyId !== id) {
      return NextResponse.json(
        { error: "Image non trouvée" },
        { status: 404 }
      )
    }

    // Si on définit une nouvelle image principale, retirer le flag des autres
    if (isMain === true) {
      await prisma.propertyImage.updateMany({
        where: { propertyId: id, isMain: true },
        data: { isMain: false },
      })
    }

    // Mettre à jour l'image
    const updatedImage = await prisma.propertyImage.update({
      where: { id: imageId },
      data: {
        ...(isMain !== undefined && { isMain }),
        ...(order !== undefined && { order }),
      },
    })

    return NextResponse.json(updatedImage)
  } catch (error) {
    console.error("Error updating image:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'image" },
      { status: 500 }
    )
  }
}
