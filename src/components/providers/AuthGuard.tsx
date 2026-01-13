"use client"

import { useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

interface AuthGuardProps {
  children: React.ReactNode
}

/**
 * Composant qui surveille l'état de la session et gère l'expiration des tokens
 * Doit être placé à l'intérieur du SessionProvider
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Si la session a une erreur (token expiré), déconnecter l'utilisateur
    if (session?.error) {
      console.log("[AUTH] Session error detected:", session.error)
      signOut({ callbackUrl: "/admin/login" })
    }
  }, [session?.error])

  useEffect(() => {
    // Rafraîchir la session périodiquement pour vérifier l'expiration
    const refreshInterval = setInterval(() => {
      // Déclencher une vérification de session
      if (status === "authenticated") {
        router.refresh()
      }
    }, 60 * 1000) // Toutes les minutes

    return () => clearInterval(refreshInterval)
  }, [status, router])

  return <>{children}</>
}

