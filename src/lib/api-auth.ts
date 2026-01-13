import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

/**
 * Vérifie l'authentification pour les API routes
 * Retourne la session si authentifié, ou une réponse d'erreur sinon
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return {
      authenticated: false as const,
      response: NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      ),
    }
  }

  // Vérifier si le token a une erreur (expiré, etc.)
  if (session.error) {
    return {
      authenticated: false as const,
      response: NextResponse.json(
        { error: "Session expirée. Veuillez vous reconnecter." },
        { status: 401 }
      ),
    }
  }

  return {
    authenticated: true as const,
    session,
  }
}
