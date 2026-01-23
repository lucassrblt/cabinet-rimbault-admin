import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { uploadToStorage, BUCKETS } from "@/lib/supabase"
import { requireAuth } from "@/lib/api-auth"
import { upsertPropertyDocument } from "@/lib/documents"

/**
 * POST /api/labels/upload-pdf
 * Upload a generated PDF label to the 'property-files' bucket under [reference]/labels/
 * Stores the document in PropertyDocument table with type LABEL_PDF
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

    // Store document in PropertyDocument table
    await upsertPropertyDocument({
      propertyId,
      type: "LABEL_PDF",
      url: pdfUrl!,
      name: `${property.reference}_etiquette.pdf`,
      size: file.size,
      mimeType: "application/pdf",
      description: "Étiquette énergie vitrine",
    })

    // Fetch updated property with documents
    const updatedProperty = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        energy: true,
        documents: {
          where: { type: "LABEL_PDF" },
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    })

    return NextResponse.json({
      success: true,
      pdfUrl,
      property: {
        id: updatedProperty?.id,
        reference: updatedProperty?.reference,
        labelPdfUrl: updatedProperty?.documents[0]?.url ?? null,
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
