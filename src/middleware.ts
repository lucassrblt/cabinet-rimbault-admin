import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Si on est sur la racine, rediriger vers /dashboard si connecté
    // ou vers /login si pas connecté
    if (pathname === "/") {
      if (token) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Routes protégées (toutes sauf /login)
    if (!pathname.startsWith("/login") && !pathname.startsWith("/api")) {
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url))
      }
    }

    // Protection des API (auth et users sont exclus du middleware via matcher)
    if (pathname.startsWith("/api")) {
      if (!token) {
        return NextResponse.json(
          { error: "Vous n'êtes pas autorisé à effectuer cette action." },
          { status: 401 }
        )
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Toujours autoriser l'accès à la page de login
        if (pathname.startsWith("/login")) {
          return true
        }

        // Pour la racine, on laisse passer pour gérer la redirection dans middleware
        if (pathname === "/") {
          return true
        }

        // Pour toutes les autres routes protégées, vérifier le token
        if (pathname.startsWith("/api")) {
          return !!token
        }

        // Routes authentifiées
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/users (utilise son propre système d'auth avec Bearer token)
     * - api/auth (routes NextAuth)
     */
    "/((?!_next/static|_next/image|favicon.ico|public/|api/users|api/auth).*)",
  ],
}

