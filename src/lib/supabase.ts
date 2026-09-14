import { createClient, SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined"
  )
}

// Client public (pour le frontend - respecte les RLS policies)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client admin (pour le backend - bypass RLS policies)
// Utilisé pour les opérations serveur comme l'upload de fichiers
export const supabaseAdmin: SupabaseClient | null = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

/**
 * Test the connection to Supabase
 * Throws an error if the connection fails
 */
export async function testSupabaseConnection(): Promise<void> {
  try {
    // Test connection by listing buckets (a simple operation that requires valid credentials)
    const { error } = await supabase.storage.listBuckets()
    
    if (error) {
      throw new Error(`Supabase connection test failed: ${error.message}`)
    }
    
    console.log("✅ Supabase connection successful")
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("❌ Supabase connection failed:", message)
    throw new Error(`Failed to connect to Supabase: ${message}`)
  }
}

// Bucket names - IMPORTANT: ces noms doivent correspondre aux buckets créés dans Supabase
export const BUCKETS = {
  PROPERTY_FILES: "property-files", // Bucket unique : images, fichiers DPE/GES, PDFs
  PROPERTY_IMAGES: "property-images", // Déprécié : conservé pour résoudre les anciennes URLs
} as const

/**
 * Upload a file to Supabase storage
 * Utilise le client admin (service role) si disponible pour bypass les RLS policies
 */
export async function uploadToStorage(
  bucket: string,
  path: string,
  file: Blob | File | ArrayBuffer | Buffer,
  contentType?: string
): Promise<{ url: string | null; error: Error | null }> {
  // Utiliser le client admin pour les uploads (bypass RLS)
  const client = supabaseAdmin || supabase
  
  if (!supabaseAdmin) {
    console.warn(
      "⚠️ SUPABASE_SERVICE_ROLE_KEY non configurée. L'upload utilisera la clé anonyme et pourrait échouer à cause des RLS policies."
    )
  }

  try {
    // Convertir Buffer en Uint8Array pour compatibilité avec Supabase
    const fileData = Buffer.isBuffer(file) ? new Uint8Array(file) : file

    const { data, error } = await client.storage
      .from(bucket)
      .upload(path, fileData, {
        contentType,
        upsert: true,
      })

    if (error) {
      console.error("Upload error:", error)
      return { url: null, error }
    }

    // Get public URL (on peut utiliser le client public pour ça)
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return { url: urlData.publicUrl, error: null }
  } catch (error) {
    console.error("Upload error:", error)
    return { url: null, error: error as Error }
  }
}

/**
 * Delete a file from Supabase storage
 * Utilise le client admin (service role) si disponible pour bypass les RLS policies
 */
export async function deleteFromStorage(
  bucket: string,
  path: string
): Promise<{ success: boolean; error: Error | null }> {
  // Utiliser le client admin pour les suppressions (bypass RLS)
  const client = supabaseAdmin || supabase

  try {
    const { error } = await client.storage.from(bucket).remove([path])

    if (error) {
      return { success: false, error }
    }

    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: error as Error }
  }
}

/**
 * Delete all files in a folder from Supabase storage
 * Utilise le client admin (service role) si disponible pour bypass les RLS policies
 * @param bucket - Le nom du bucket
 * @param folderPath - Le chemin du dossier (ex: "REF123" pour supprimer tous les fichiers dans property-files/REF123/)
 * @returns Le nombre de fichiers supprimés et les erreurs éventuelles
 */
export async function deleteFolderFromStorage(
  bucket: string,
  folderPath: string
): Promise<{ success: boolean; deletedCount: number; errors: Error[] }> {
  // Utiliser le client admin pour les suppressions (bypass RLS)
  const client = supabaseAdmin || supabase

  if (!supabaseAdmin) {
    console.warn(
      "⚠️ SUPABASE_SERVICE_ROLE_KEY non configurée. La suppression utilisera la clé anonyme et pourrait échouer à cause des RLS policies."
    )
  }

  try {
    // Normaliser le chemin du dossier (enlever le slash final s'il existe)
    const normalizedPath = folderPath.endsWith("/") 
      ? folderPath.slice(0, -1) 
      : folderPath

    // Lister tous les fichiers dans le dossier (récursif)
    const { data: files, error: listError } = await client.storage
      .from(bucket)
      .list(normalizedPath, {
        limit: 1000, // Limite maximale de Supabase
        sortBy: { column: "name", order: "asc" },
      })

    if (listError) {
      console.error("Erreur lors de la liste des fichiers:", listError)
      return { success: false, deletedCount: 0, errors: [listError] }
    }

    if (!files || files.length === 0) {
      // Le dossier est vide ou n'existe pas, c'est OK
      return { success: true, deletedCount: 0, errors: [] }
    }

    // Collecter tous les chemins de fichiers (récursif pour les sous-dossiers)
    const allFilePaths: string[] = []
    const errors: Error[] = []

    // Fonction récursive pour collecter tous les fichiers
    const collectFiles = async (currentPath: string) => {
      const { data: items, error } = await client.storage
        .from(bucket)
        .list(currentPath, {
          limit: 1000,
          sortBy: { column: "name", order: "asc" },
        })

      if (error) {
        errors.push(error)
        return
      }

      if (!items) return

      for (const item of items) {
        const itemPath = `${currentPath}/${item.name}`
        
        if (item.id === null) {
          // C'est un dossier, explorer récursivement
          await collectFiles(itemPath)
        } else {
          // C'est un fichier
          allFilePaths.push(itemPath)
        }
      }
    }

    // Collecter tous les fichiers récursivement
    await collectFiles(normalizedPath)

    if (allFilePaths.length === 0) {
      return { success: true, deletedCount: 0, errors }
    }

    // Supprimer tous les fichiers en une seule opération
    const { error: deleteError } = await client.storage
      .from(bucket)
      .remove(allFilePaths)

    if (deleteError) {
      console.error("Erreur lors de la suppression des fichiers:", deleteError)
      errors.push(deleteError)
      return { 
        success: false, 
        deletedCount: 0, 
        errors 
      }
    }

    return { 
      success: true, 
      deletedCount: allFilePaths.length, 
      errors 
    }
  } catch (error) {
    console.error("Erreur lors de la suppression du dossier:", error)
    return { 
      success: false, 
      deletedCount: 0, 
      errors: [error as Error] 
    }
  }
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

