import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { uploadToStorage, BUCKETS } from "@/lib/supabase"
import { requireAuth } from "@/lib/api-auth"

/**
 * POST /api/labels/upload-pdf
 * Upload a generated PDF label to the 'property-files' bucket under [reference]/labels/
 */
export async function POST(request: Request) {
  // Vérification de l'authentification
  const authResult = await requireAuth()
  if (!authResult.authenticated) {
    return authResult.response
  }

  try {
    const formData = await request.formData()
    const file = formData.get("pdf") as File | null
    const propertyId = formData.get("propertyId") as string | null

    if (!file) {
      return NextResponse.json(
        { error: "Fichier PDF requis" },
        { status: 400 }
      )
    }

    if (!propertyId) {
      return NextResponse.json(
        { error: "ID de propriété requis" },
        { status: 400 }
      )
    }

    // Fetch property with energy data to get reference
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

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // Generate filename with timestamp in property-files/[reference]/labels/
    const timestamp = Date.now()
    const pdfFileName = `${property.reference}/labels/${property.reference}_etiquette_${timestamp}.pdf`

    // Upload PDF to 'property-files' bucket in labels folder
    const { url: pdfUrl, error: uploadError } = await uploadToStorage(
      BUCKETS.PROPERTY_FILES,
      pdfFileName,
      arrayBuffer,
      "application/pdf"
    )

    if (uploadError) {
      console.error("Error uploading PDF:", uploadError)
      return NextResponse.json(
        { error: "Erreur lors de l'upload du PDF" },
        { status: 500 }
      )
    }

    // Update property energy table with PDF URL
    if (property.energy) {
      await prisma.propertyEnergy.update({
        where: { propertyId: propertyId },
        data: {
          labelPdfUrl: pdfUrl,
        },
      })
    } else {
      // Create energy record if it doesn't exist
      await prisma.propertyEnergy.create({
        data: {
          propertyId: propertyId,
          labelPdfUrl: pdfUrl,
        },
      })
    }

    // Fetch updated property
    const updatedProperty = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        energy: true,
      },
    })

    return NextResponse.json({
      success: true,
      pdfUrl,
      property: {
        id: updatedProperty?.id,
        reference: updatedProperty?.reference,
        labelPdfUrl: updatedProperty?.energy?.labelPdfUrl,
      },
    })
  } catch (error) {
    console.error("Error uploading PDF label:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'upload du PDF" },
      { status: 500 }
    )
  }
}
