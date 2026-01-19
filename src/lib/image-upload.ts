import imageCompression from "browser-image-compression"

/**
 * Options de compression d'images
 * Configuration optimisée pour maintenir la qualité tout en réduisant la taille
 */
const COMPRESSION_OPTIONS = {
  maxSizeMB: 1.5, // Taille max par image après compression
  maxWidthOrHeight: 2000, // Dimension maximale (préserve les détails pour les biens immobiliers)
  useWebWorker: true, // Utilise un web worker pour ne pas bloquer l'UI
  fileType: "image/jpeg" as const, // Convertir en JPEG pour meilleure compression
  initialQuality: 0.85, // Qualité initiale (85% = bon compromis qualité/taille)
}

/**
 * Compresse une image tout en préservant la qualité
 */
export async function compressImage(file: File): Promise<File> {
  // Si l'image est déjà petite (< 500KB), on ne la compresse pas
  if (file.size < 500 * 1024) {
    return file
  }

  try {
    const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS)
    
    // Log pour debug
    const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2)
    const compressedSizeMB = (compressedFile.size / (1024 * 1024)).toFixed(2)
    const reduction = (((file.size - compressedFile.size) / file.size) * 100).toFixed(1)
    
    console.log(
      `📸 Image compressée: ${file.name} - ${originalSizeMB}MB → ${compressedSizeMB}MB (-${reduction}%)`
    )
    
    return compressedFile
  } catch (error) {
    console.error("Erreur lors de la compression:", error)
    // En cas d'erreur, retourner le fichier original
    return file
  }
}

/**
 * Type pour les réponses de l'API de signed URLs
 */
interface SignedUrlResponse {
  signedUrl: string
  path: string
  token: string
  publicUrl: string
}

interface BatchSignedUrlResponse {
  signedUrls: Array<SignedUrlResponse & { filename: string; error?: string }>
}

/**
 * Récupère des URLs signées pour l'upload depuis le backend
 */
async function getSignedUploadUrls(
  files: File[],
  propertyReference: string
): Promise<BatchSignedUrlResponse> {
  const response = await fetch("/api/upload/signed-url", {
    method: "PUT", // PUT pour le batch
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      files: files.map((f) => ({
        filename: f.name,
        contentType: f.type,
      })),
      propertyReference,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Erreur lors de la récupération des URLs signées")
  }

  return response.json()
}

/**
 * Upload une image vers Supabase via une URL signée
 */
async function uploadWithSignedUrl(
  file: File,
  signedUrl: string,
  token: string,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; error?: string }> {
  try {
    onProgress?.(10)
    
    // Compresser l'image
    const compressedFile = await compressImage(file)
    onProgress?.(40)

    // Upload vers Supabase avec le token
    const response = await fetch(signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": compressedFile.type || "image/jpeg",
      },
      body: compressedFile,
    })

    onProgress?.(90)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Upload error:", errorText)
      return { success: false, error: `Upload failed: ${response.status}` }
    }

    onProgress?.(100)
    return { success: true }
  } catch (error) {
    console.error("Erreur upload:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    }
  }
}

/**
 * Upload multiple images en parallèle avec signed URLs
 * Flow: Backend génère signed URLs → Frontend upload directement → Retourne les infos
 */
export async function uploadMultipleImages(
  files: File[],
  propertyReference: string,
  onOverallProgress?: (uploaded: number, total: number) => void
): Promise<{
  uploaded: Array<{ url: string; filename: string; size: number }>
  failed: Array<{ filename: string; error: string }>
}> {
  const uploaded: Array<{ url: string; filename: string; size: number }> = []
  const failed: Array<{ filename: string; error: string }> = []

  if (files.length === 0) {
    return { uploaded, failed }
  }

  try {
    // 1. Récupérer les URLs signées pour tous les fichiers
    console.log(`📤 Récupération de ${files.length} URLs signées...`)
    const { signedUrls } = await getSignedUploadUrls(files, propertyReference)

    // 2. Upload en parallèle par batch de 3
    const BATCH_SIZE = 3
    let completedCount = 0

    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batchFiles = files.slice(i, i + BATCH_SIZE)
      const batchUrls = signedUrls.slice(i, i + BATCH_SIZE)

      const batchResults = await Promise.all(
        batchFiles.map(async (file, batchIndex) => {
          const urlInfo = batchUrls[batchIndex]
          
          // Si erreur lors de la génération de l'URL
          if (urlInfo.error) {
            return {
              filename: file.name,
              success: false,
              error: urlInfo.error,
              publicUrl: null,
              size: 0,
            }
          }

          // Upload avec l'URL signée
          const compressedFile = await compressImage(file)
          const uploadResult = await uploadWithSignedUrl(
            compressedFile,
            urlInfo.signedUrl,
            urlInfo.token
          )

          completedCount++
          onOverallProgress?.(completedCount, files.length)

          return {
            filename: file.name,
            success: uploadResult.success,
            error: uploadResult.error,
            publicUrl: urlInfo.publicUrl,
            size: compressedFile.size,
          }
        })
      )

      // Séparer succès et échecs
      batchResults.forEach((result) => {
        if (result.success && result.publicUrl) {
          uploaded.push({
            url: result.publicUrl,
            filename: result.filename,
            size: result.size,
          })
        } else {
          failed.push({
            filename: result.filename,
            error: result.error || "Erreur inconnue",
          })
        }
      })
    }

    console.log(`✅ Upload terminé: ${uploaded.length} succès, ${failed.length} échecs`)
    return { uploaded, failed }
  } catch (error) {
    console.error("Erreur lors de l'upload:", error)
    // En cas d'erreur globale, marquer tous les fichiers comme échoués
    files.forEach((file) => {
      failed.push({
        filename: file.name,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      })
    })
    return { uploaded, failed }
  }
}

/**
 * Upload une seule image (wrapper pour compatibilité)
 */
export async function uploadImageDirectly(
  file: File,
  propertyReference: string,
  onProgress?: (progress: number) => void
): Promise<{
  url: string | null
  error: Error | null
  filename: string
  size: number
}> {
  const { uploaded, failed } = await uploadMultipleImages(
    [file],
    propertyReference,
    (count, total) => onProgress?.((count / total) * 100)
  )

  if (uploaded.length > 0) {
    return {
      url: uploaded[0].url,
      error: null,
      filename: uploaded[0].filename,
      size: uploaded[0].size,
    }
  }

  return {
    url: null,
    error: new Error(failed[0]?.error || "Upload échoué"),
    filename: file.name,
    size: 0,
  }
}
