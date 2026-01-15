import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { uploadToStorage, BUCKETS } from "@/lib/supabase"
import { requireAuth } from "@/lib/api-auth"

// Configuration App Router pour cette route
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 60 secondes max pour l'upload

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
    const userId = authResult.session.user.id
    console.log(`[Upload PDF] File: ${pdfFile.name}, size: ${(pdfFile.size / 1024).toFixed(2)} KB`)
    console.log(`[Upload PDF] PropertyId: ${propertyId}, UserId: ${userId}`)

    // Verify property exists and belongs to user
    const property = await prisma.property.findFirst({
      where: { id: propertyId, userId: userId },
      include: { energy: true },
    })

    if (!property) {
      // Debug: check if property exists at all
      const propertyExists = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { id: true, userId: true }
      })
      
      if (!propertyExists) {
        console.error(`[Upload PDF] Property not found: ${propertyId}`)
        return NextResponse.json({ error: "Propriété non trouvée" }, { status: 404 })
      } else {
        console.error(`[Upload PDF] Property ${propertyId} belongs to ${propertyExists.userId}, not ${userId}`)
        return NextResponse.json({ error: "Accès non autorisé à cette propriété" }, { status: 403 })
      }
    }

    console.log(`[Upload PDF] Property found: ${property.reference}`)

    // Convert File to ArrayBuffer then to Buffer
    const arrayBuffer = await pdfFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload PDF to Supabase Storage
    const fileName = `${propertyId}/${Date.now()}_fiche_descriptive.pdf`
    
    // Essayer d'abord le bucket descriptive_sheets, sinon fallback sur labels
    let pdfUrl: string | null = null
    let uploadError: Error | null = null

    // Tentative sur le bucket descriptive_sheets
    const result = await uploadToStorage(
      BUCKETS.DESCRIPTIVE_SHEETS,
      fileName,
      buffer,
      "application/pdf"
    )

    if (result.url) {
      pdfUrl = result.url
      console.log(`[Upload PDF] Success on descriptive_sheets bucket: ${pdfUrl}`)
    } else {
      console.warn(`[Upload PDF] Failed on descriptive_sheets bucket:`, result.error)
      
      // Fallback sur le bucket labels
      const fallbackResult = await uploadToStorage(
        BUCKETS.LABELS,
        `descriptive-sheets/${fileName}`,
        buffer,
        "application/pdf"
      )

      if (fallbackResult.url) {
        pdfUrl = fallbackResult.url
        console.log(`[Upload PDF] Success on labels bucket (fallback): ${pdfUrl}`)
      } else {
        uploadError = fallbackResult.error
        console.error(`[Upload PDF] Failed on both buckets:`, uploadError)
      }
    }

    if (!pdfUrl) {
      return NextResponse.json(
        { 
          error: "Erreur lors de l'upload du PDF. Vérifiez que le bucket 'descriptive_sheets' existe dans Supabase.",
          details: uploadError?.message 
        },
        { status: 500 }
      )
    }

    // Update property energy record with descriptive sheet info
    if (property.energy) {
      await prisma.propertyEnergy.update({
        where: { id: property.energy.id },
        data: {
          descriptiveSheetGenerated: true,
          descriptiveSheetGeneratedAt: new Date(),
          descriptiveSheetPdfUrl: pdfUrl,
        },
      })
    } else {
      // Create energy record if it doesn't exist
      await prisma.propertyEnergy.create({
        data: {
          propertyId: property.id,
          descriptiveSheetGenerated: true,
          descriptiveSheetGeneratedAt: new Date(),
          descriptiveSheetPdfUrl: pdfUrl,
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

