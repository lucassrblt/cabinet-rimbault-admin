import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { uploadToStorage, BUCKETS } from "@/lib/supabase"
import { requireAuth } from "@/lib/api-auth"
import { upsertPropertyDocument } from "@/lib/documents"

// Configuration App Router pour cette route
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 60 secondes max pour l'upload

/**
 * POST /api/descriptive-sheets/upload-pdf
 * Upload a generated descriptive sheet PDF to storage
 * Stores the document in PropertyDocument table with type DESCRIPTIVE_SHEET_PDF
 */
export async function POST(request: NextRequest) {
  // Check authentication
  const authResult = await requireAuth()
  if (!authResult.authenticated) {
    return authResult.response
  }

  try {
    let formData: FormData
    try {
      formData = await request.formData()
    } catch (e) {
      console.error("Error parsing FormData:", e)
      return NextResponse.json(
        { error: "Erreur lors du parsing du fichier" },
        { status: 400 }
      )
    }

    const pdfFile = formData.get("pdf") as File | null
    const propertyId = formData.get("propertyId") as string | null

    if (!pdfFile || !propertyId) {
      return NextResponse.json(
        { error: "Fichier PDF et ID de propriété requis" },
        { status: 400 }
      )
    }

    // Log file info for debugging
    console.log(`[Upload PDF] File: ${pdfFile.name}, size: ${(pdfFile.size / 1024).toFixed(2)} KB`)
    console.log(`[Upload PDF] PropertyId: ${propertyId}`)

    // Verify property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { energy: true },
    })

    if (!property) {
      console.error(`[Upload PDF] Property not found: ${propertyId}`)
      return NextResponse.json({ error: "Propriété non trouvée" }, { status: 404 })
    }

    console.log(`[Upload PDF] Property found: ${property.reference}`)

    // Convert File to ArrayBuffer then to Buffer
    const arrayBuffer = await pdfFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload PDF to Supabase Storage
    // Chemin: property-files/[reference]/descriptive-sheet/fiche_descriptive.pdf
    const fileName = `${property.reference}/descriptive-sheet/${Date.now()}_fiche_descriptive.pdf`
    
    let pdfUrl: string | null = null
    let uploadError: Error | null = null

    // Upload sur le bucket property-files
    const result = await uploadToStorage(
      BUCKETS.PROPERTY_FILES,
      fileName,
      buffer,
      "application/pdf"
    )

    if (result.url) {
      pdfUrl = result.url
      console.log(`[Upload PDF] Success on property-files bucket: ${pdfUrl}`)
    } else {
      uploadError = result.error
      console.error(`[Upload PDF] Failed on property-files bucket:`, uploadError)
    }

    if (!pdfUrl) {
      return NextResponse.json(
        { 
          error: "Erreur lors de l'upload du PDF. Vérifiez que le bucket 'property-files' existe dans Supabase.",
          details: uploadError?.message 
        },
        { status: 500 }
      )
    }

    // Store document in PropertyDocument table
    await upsertPropertyDocument({
      propertyId,
      type: "DESCRIPTIVE_SHEET_PDF",
      url: pdfUrl,
      name: `${property.reference}_fiche_descriptive.pdf`,
      size: pdfFile.size,
      mimeType: "application/pdf",
      description: "Fiche descriptive du bien",
    })

    // Update property energy record with generation metadata
    if (property.energy) {
      await prisma.propertyEnergy.update({
        where: { id: property.energy.id },
        data: {
          descriptiveSheetGenerated: true,
          descriptiveSheetGeneratedAt: new Date(),
        },
      })
    } else {
      // Create energy record if it doesn't exist
      await prisma.propertyEnergy.create({
        data: {
          propertyId: property.id,
          descriptiveSheetGenerated: true,
          descriptiveSheetGeneratedAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      pdfUrl,
    })
  } catch (error) {
    console.error("Error uploading descriptive sheet PDF:", error)
    return NextResponse.json(
      { error: "Erreur serveur lors de l'upload" },
      { status: 500 }
    )
  }
}

