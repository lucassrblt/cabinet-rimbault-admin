"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import { AuthGuard } from "./AuthGuard"

interface SessionProviderProps {
  children: React.ReactNode
  withAuthGuard?: boolean
}

export function SessionProvider({ children, withAuthGuard = true }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider>
      {withAuthGuard ? (
        <AuthGuard>{children}</AuthGuard>
      ) : (
        children
      )}
    </NextAuthSessionProvider>
  )
}
