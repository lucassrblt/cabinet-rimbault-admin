import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withPublicApiAuth } from "@/lib/api-public-auth"
import {
  getPublicPropertiesWhere,
  getPublicPropertiesIncludeList,
  sanitizePropertiesForPublic,
} from "@/lib/api-public-helpers"
import { Prisma } from "@prisma/client"

// GET /api/public/properties - Rechercher des propriétés avec filtres
// Query params optionnels:
// - ?postalCode=75001 : filtrer par code postal
// - ?city=Paris : filtrer par ville
// - ?transactionType=VENTE : filtrer par type de transaction (VENTE, LOCATION)
// - ?propertyType=APPARTEMENT : filtrer par type de bien
// - ?minPrice=100000 : prix minimum
// - ?maxPrice=500000 : prix maximum
// - ?minSurface=50 : surface minimum
// - ?maxSurface=150 : surface maximum
// - ?bedrooms=3 : nombre de chambres minimum
// - ?sortBy=date : trier par date (date), prix croissant (price_asc) ou prix décroissant (price_desc)
// - ?limit=20 : limiter le nombre de résultats (par défaut 50, max 100)
// - ?offset=0 : pagination (par défaut 0)
export async function GET(request: NextRequest) {
  return withPublicApiAuth(request, async (req) => {
    try {
      const { searchParams } = new URL(req.url)
      
      // Paramètres de filtrage
      const postalCode = searchParams.get("postalCode")
      const city = searchParams.get("city")
      const transactionType = searchParams.get("transactionType")
      const propertyType = searchParams.get("propertyType")
      const minPrice = searchParams.get("minPrice")
      const maxPrice = searchParams.get("maxPrice")
      const minSurface = searchParams.get("minSurface")
      const maxSurface = searchParams.get("maxSurface")
      const bedrooms = searchParams.get("bedrooms")
      const sortBy = searchParams.get("sortBy") || "date"
      
      // Paramètres de pagination
      const limitParam = searchParams.get("limit")
      const offsetParam = searchParams.get("offset")
      
      // Parse pagination avec valeurs par défaut
      const limit = limitParam ? parseInt(limitParam, 10) : 50
      const offset = offsetParam ? parseInt(offsetParam, 10) : 0
      const validLimit = Math.max(1, Math.min(limit, 100))
      const validOffset = Math.max(0, offset)

      // Construire les filtres
      const where: Prisma.PropertyWhereInput = {
        ...getPublicPropertiesWhere(),
        ...(transactionType && { transactionType: transactionType as any }),
        ...(propertyType && { propertyType: propertyType as any }),
        ...(postalCode || city ? {
          location: {
            ...(postalCode ? { postalCode } : {}),
            ...(city ? { city: { contains: city, mode: "insensitive" as const } } : {}),
          }
        } : {}),
        ...(minPrice || maxPrice ? {
          finance: {
            price: {
              ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
              ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
            }
          }
        } : {}),
        ...(minSurface || maxSurface || bedrooms ? {
          characteristics: {
            ...(minSurface || maxSurface ? {
              surface: {
                ...(minSurface ? { gte: parseFloat(minSurface) } : {}),
                ...(maxSurface ? { lte: parseFloat(maxSurface) } : {}),
              }
            } : {}),
            ...(bedrooms ? { bedrooms: { gte: parseInt(bedrooms, 10) } } : {}),
          }
        } : {}),
      }

      // Compter le nombre total de résultats
      const total = await prisma.property.count({ where })

      // Déterminer l'ordre de tri
      let orderBy: Prisma.PropertyOrderByWithRelationInput
      switch (sortBy) {
        case "price_asc":
          orderBy = { finance: { price: "asc" } }
          break
        case "price_desc":
          orderBy = { finance: { price: "desc" } }
          break
        case "date":
        default:
          orderBy = { createdAt: "desc" }
          break
      }

      // Récupérer les propriétés
      const properties = await prisma.property.findMany({
        where,
        orderBy,
        skip: validOffset,
        take: validLimit,
        include: getPublicPropertiesIncludeList(),
      })

      // Nettoyer les données sensibles
      const sanitizedProperties = sanitizePropertiesForPublic(properties)

      return NextResponse.json({
        success: true,
        count: sanitizedProperties.length,
        total,
        offset: validOffset,
        limit: validLimit,
        filters: {
          ...(postalCode && { postalCode }),
          ...(city && { city }),
          ...(transactionType && { transactionType }),
          ...(propertyType && { propertyType }),
          ...(minPrice && { minPrice: parseFloat(minPrice) }),
          ...(maxPrice && { maxPrice: parseFloat(maxPrice) }),
          ...(minSurface && { minSurface: parseFloat(minSurface) }),
          ...(maxSurface && { maxSurface: parseFloat(maxSurface) }),
          ...(bedrooms && { bedrooms: parseInt(bedrooms, 10) }),
        },
        data: sanitizedProperties,
      })
    } catch (error) {
      console.error("Error fetching properties:", error)
      return NextResponse.json(
        { 
          success: false,
          error: "Erreur lors de la récupération des propriétés",
          details: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : undefined
        },
        { status: 500 }
      )
    }
  })
}

