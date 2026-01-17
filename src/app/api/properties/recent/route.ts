import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/properties/recent - Récupérer les derniers biens visibles
// Query params: ?limit=3 (par défaut 3)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get("limit")
    
    // Parse limit avec une valeur par défaut de 3
    const limit = limitParam ? parseInt(limitParam, 10) : 3
    
    // Validation du limit (minimum 1, maximum 50 pour éviter les requêtes trop lourdes)
    const validLimit = Math.max(1, Math.min(limit || 3, 50))

    const properties = await prisma.property.findMany({
      where: {
        isPublished: true,
      },
      orderBy: { createdAt: "desc" },
      take: validLimit,
      include: {
        finance: true,
        location: true,
        characteristics: true,
        amenities: true,
        energy: true,
        copro: true,
        images: {
          orderBy: { order: "asc" },
          take: 5,
        },
      },
    })

    // Ajouter les headers CORS
    const response = NextResponse.json(properties)
    const origin = request.headers.get("origin")
    
    if (origin && (origin.includes("localhost:3000") || origin.includes("localhost:3001"))) {
      response.headers.set("Access-Control-Allow-Origin", origin)
      response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS")
      response.headers.set("Access-Control-Allow-Headers", "Content-Type")
    }

    return response
  } catch (error) {
    // Améliorer le logging des erreurs
    console.error("Error fetching recent properties:", error)
    
    // Logger les détails complets de l'erreur
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    
    // Logger les erreurs Prisma si applicable
    if (error && typeof error === "object" && "code" in error) {
      console.error("Error code:", error.code)
    }

    const errorResponse = NextResponse.json(
      { 
        error: "Erreur lors de la récupération des derniers biens",
        details: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    )

    // Ajouter les headers CORS même en cas d'erreur
    const origin = request.headers.get("origin")
    if (origin && (origin.includes("localhost:3000") || origin.includes("localhost:3001"))) {
      errorResponse.headers.set("Access-Control-Allow-Origin", origin)
      errorResponse.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS")
      errorResponse.headers.set("Access-Control-Allow-Headers", "Content-Type")
    }

    return errorResponse
  }
}

// Handler OPTIONS pour les requêtes preflight CORS
export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin")
  const response = new NextResponse(null, { status: 200 })
  
  if (origin && (origin.includes("localhost:3000") || origin.includes("localhost:3001"))) {
    response.headers.set("Access-Control-Allow-Origin", origin)
    response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type")
    response.headers.set("Access-Control-Max-Age", "86400")
  }
  
  return response
}

