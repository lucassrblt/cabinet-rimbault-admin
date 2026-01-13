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

// Bucket names
export const BUCKETS = {
  LABELS: "labels",
  FILES: "files", // Pour stocker les images DPE/GES générées
  DPE_IMAGES: "dpe-images",
  PROPERTY_IMAGES: "property-images",
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
 * Get public URL for a file
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

