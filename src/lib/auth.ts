import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import prisma from "@/lib/prisma"

// Durées des tokens
const ACCESS_TOKEN_EXPIRY = 5 * 60 // 5 minutes en secondes
const REFRESH_TOKEN_EXPIRY = 24 * 60 * 60 // 1 jour en secondes

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          throw new Error("Aucun utilisateur trouvé avec cet email")
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error("Mot de passe incorrect")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Première connexion : initialiser les tokens
      if (user) {
        const now = Math.floor(Date.now() / 1000)
        token.id = user.id
        token.accessTokenExpires = now + ACCESS_TOKEN_EXPIRY
        token.refreshTokenExpires = now + REFRESH_TOKEN_EXPIRY
        token.error = undefined
      }

      const now = Math.floor(Date.now() / 1000)

      // Si le refresh token a expiré, forcer la reconnexion
      if (token.refreshTokenExpires && now > (token.refreshTokenExpires as number)) {
        return {
          ...token,
          error: "RefreshTokenExpired",
        }
      }

      // Si l'access token a expiré mais le refresh token est valide, le renouveler
      if (token.accessTokenExpires && now > (token.accessTokenExpires as number)) {
        // Vérifier que l'utilisateur existe toujours
        try {
          const user = await prisma.user.findUnique({
            where: { id: token.id as string }
          })

          if (!user) {
            return {
              ...token,
              error: "UserNotFound",
            }
          }

          // Renouveler l'access token
          return {
            ...token,
            accessTokenExpires: now + ACCESS_TOKEN_EXPIRY,
            error: undefined,
          }
        } catch {
          return {
            ...token,
            error: "RefreshError",
          }
        }
      }

      // L'access token est encore valide
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }

      // Passer l'erreur à la session pour que le client puisse réagir
      if (token.error) {
        session.error = token.error as string
      }

      return session
    }
  },
  events: {
    async signIn({ user }) {
      // Log de connexion (optionnel pour audit)
      console.log(`[AUTH] Utilisateur connecté: ${user.email}`)
    },
    async signOut({ token }) {
      console.log(`[AUTH] Utilisateur déconnecté: ${token?.email}`)
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: REFRESH_TOKEN_EXPIRY, // Session expire avec le refresh token
  },
  jwt: {
    maxAge: REFRESH_TOKEN_EXPIRY, // JWT expire avec le refresh token
  },
  secret: process.env.NEXTAUTH_SECRET,
}
