import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { supabaseAdmin, BUCKETS } from "@/lib/supabase"

export const dynamic = "force-dynamic"

/**
 * POST /api/upload/signed-url
 * Génère une URL signée pour upload direct vers Supabase Storage
 * 
 * Body: { filename: string, contentType: string, propertyReference: string }
 * Returns: { signedUrl: string, path: string, token: string }
 */
export async function POST(request: Request) {
  // Vérifier l'authentification
  const authResult = await requireAuth()
  if (!authResult.authenticated) {
    return authResult.response
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Service de stockage non configuré (SUPABASE_SERVICE_ROLE_KEY manquante)" },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    const { filename, contentType, propertyReference } = body

    if (!filename || !propertyReference) {
      return NextResponse.json(
        { error: "filename et propertyReference sont requis" },
        { status: 400 }
      )
    }

    // Générer un nom unique pour éviter les collisions
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 9)
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_")
    const uniqueFilename = `${timestamp}-${randomSuffix}-${sanitizedFilename}`
    
    // Chemin dans le bucket: propertyReference/images/filename
    const path = `${propertyReference}/images/${uniqueFilename}`

    // Créer une URL signée pour l'upload (valide 10 minutes)
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKETS.PROPERTY_FILES)
      .createSignedUploadUrl(path)

    if (error) {
      console.error("Erreur création URL signée:", error)
      return NextResponse.json(
        { error: `Erreur création URL signée: ${error.message}` },
        { status: 500 }
      )
    }

    // Construire l'URL publique finale
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(BUCKETS.PROPERTY_FILES)
      .getPublicUrl(path)

    return NextResponse.json({
      signedUrl: data.signedUrl,
      path: path,
      token: data.token,
      publicUrl: publicUrlData.publicUrl,
    })
  } catch (error) {
    console.error("Erreur génération URL signée:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/upload/signed-url/batch
 * Génère plusieurs URLs signées en une seule requête
 */
export async function PUT(request: Request) {
  const authResult = await requireAuth()
  if (!authResult.authenticated) {
    return authResult.response
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Service de stockage non configuré" },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    const { files, propertyReference } = body

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: "files array requis" },
        { status: 400 }
      )
    }

    if (!propertyReference) {
      return NextResponse.json(
        { error: "propertyReference requis" },
        { status: 400 }
      )
    }

    // Limiter à 20 fichiers par requête
    if (files.length > 20) {
      return NextResponse.json(
        { error: "Maximum 20 fichiers par requête" },
        { status: 400 }
      )
    }

    const signedUrls = await Promise.all(
      files.map(async (file: { filename: string; contentType: string }) => {
        const timestamp = Date.now()
        const randomSuffix = Math.random().toString(36).substring(2, 9)
        const sanitizedFilename = file.filename.replace(/[^a-zA-Z0-9.-]/g, "_")
        const uniqueFilename = `${timestamp}-${randomSuffix}-${sanitizedFilename}`
        // Chemin dans le bucket: propertyReference/images/filename
        const path = `${propertyReference}/images/${uniqueFilename}`

        const { data, error } = await supabaseAdmin!.storage
          .from(BUCKETS.PROPERTY_FILES)
          .createSignedUploadUrl(path)

        if (error) {
          return {
            filename: file.filename,
            error: error.message,
          }
        }

        const { data: publicUrlData } = supabaseAdmin!.storage
          .from(BUCKETS.PROPERTY_FILES)
          .getPublicUrl(path)

        return {
          filename: file.filename,
          signedUrl: data.signedUrl,
          path: path,
          token: data.token,
          publicUrl: publicUrlData.publicUrl,
        }
      })
    )

    return NextResponse.json({ signedUrls })
  } catch (error) {
    console.error("Erreur génération URLs signées batch:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    )
  }
}

