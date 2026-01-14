import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-auth"
import { uploadToStorage, deleteFromStorage, BUCKETS } from "@/lib/supabase"

// POST /api/properties/[id]/images - Upload des images pour une propriété
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

    const formData = await request.formData()
    const files = formData.getAll("images") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "Aucune image fournie" },
        { status: 400 }
      )
    }

    // Limiter à 20 images
    const existingImagesCount = property.images.length
    const maxNewImages = 20 - existingImagesCount
    const filesToUpload = files.slice(0, maxNewImages)

    if (filesToUpload.length < files.length) {
      console.warn(
        `Limite de 20 images atteinte. ${files.length - filesToUpload.length} images ignorées.`
      )
    }

    const uploadedImages = []
    const startOrder = existingImagesCount

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i]
      
      // Générer un nom unique pour le fichier
      const timestamp = Date.now()
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
      const fileName = `${timestamp}-${sanitizedName}`
      const filePath = `properties/${id}/${fileName}`

      // Convertir le fichier en buffer
      const buffer = Buffer.from(await file.arrayBuffer())

      // Upload vers Supabase
      const { url, error } = await uploadToStorage(
        BUCKETS.PROPERTY_IMAGES,
        filePath,
        buffer,
        file.type
      )

      if (error || !url) {
        console.error(`Erreur upload image ${file.name}:`, error)
        continue
      }

      // Créer l'entrée en base de données
      const image = await prisma.propertyImage.create({
        data: {
          url,
          alt: file.name.replace(/\.[^/.]+$/, ""), // Nom sans extension
          order: startOrder + i,
          isMain: existingImagesCount === 0 && i === 0, // Première image = principale
          propertyId: id,
          size: file.size,
        },
      })

      uploadedImages.push(image)
    }

    return NextResponse.json({
      success: true,
      uploaded: uploadedImages.length,
      images: uploadedImages,
    })
  } catch (error) {
    console.error("Error uploading images:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'upload des images" },
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
    const urlParts = image.url.split(`${BUCKETS.PROPERTY_IMAGES}/`)
    if (urlParts.length > 1) {
      const filePath = urlParts[1]
      // Supprimer le fichier de Supabase
      await deleteFromStorage(BUCKETS.PROPERTY_IMAGES, filePath)
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

