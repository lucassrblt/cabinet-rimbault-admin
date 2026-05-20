import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token
    const origin = req.headers.get("origin")

    // Gestion des requêtes OPTIONS (preflight CORS)
    if (req.method === "OPTIONS") {
      const response = new NextResponse(null, { status: 200 })
      
      if (origin && (origin.includes("localhost:3000") || origin.includes("localhost:3001"))) {
        response.headers.set("Access-Control-Allow-Origin", origin)
        response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        response.headers.set("Access-Control-Max-Age", "86400")
      }
      
      return response
    }

    // Routes publiques de l'API (pas besoin d'authentification)
    // Note : /api/public/* a été extrait vers le repo cabinet-rimbault-api.
    const publicApiRoutes = [
      "/api/properties/recent",
      "/api/evaluations", // POST est public, GET vérifie l'auth dans le handler
    ]

    const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route))

    // Si on est sur la racine, rediriger vers /dashboard si connecté
    // ou vers /login si pas connecté
    if (pathname === "/") {
      if (token) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Routes protégées (toutes sauf /login et API publiques)
    if (!pathname.startsWith("/login") && !pathname.startsWith("/api")) {
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url))
      }
    }

    // Protection des API (auth, users et routes publiques sont exclus)
    if (pathname.startsWith("/api") && !isPublicApiRoute) {
      if (!token) {
        const errorResponse = NextResponse.json(
          { error: "Vous n'êtes pas autorisé à effectuer cette action." },
          { status: 401 }
        )
        
        // Ajouter les headers CORS même pour les erreurs 401
        if (origin && (origin.includes("localhost:3000") || origin.includes("localhost:3001"))) {
          errorResponse.headers.set("Access-Control-Allow-Origin", origin)
          errorResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
          errorResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        }
        
        return errorResponse
      }
    }

    const response = NextResponse.next()

    // Ajouter les headers CORS pour les routes publiques de l'API
    if (isPublicApiRoute && origin && (origin.includes("localhost:3000") || origin.includes("localhost:3001"))) {
      response.headers.set("Access-Control-Allow-Origin", origin)
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    }

    return response
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

        // Routes publiques de l'API (pas besoin d'authentification)
        // Note : /api/public/* a été extrait vers le repo cabinet-rimbault-api.
        const publicApiRoutes = [
          "/api/properties/recent",
          "/api/evaluations", // POST est public, GET vérifie l'auth dans le handler
        ]

        const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route))

        // Autoriser les routes publiques de l'API
        if (isPublicApiRoute) {
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
     * - api/properties/recent (route publique pour les biens récents)
     * - api/evaluations (POST public, GET vérifie l'auth dans le handler)
     *
     * Note : /api/public/* a été extrait vers le repo cabinet-rimbault-api.
     */
    "/((?!_next/static|_next/image|favicon.ico|public/|api/users|api/auth|api/properties/recent|api/evaluations).*)",
  ],
}

