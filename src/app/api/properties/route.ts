import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-auth"
import { Prisma, TransactionType } from "@prisma/client"

// GET /api/properties - Liste des annonces
export async function GET(request: Request) {
  const authResult = await requireAuth()
  if (!authResult.authenticated) {
    return authResult.response
  }

  try {
    const { searchParams } = new URL(request.url)
    const labelFilter = searchParams.get("labelFilter")
    const descriptiveSheetFilter = searchParams.get("descriptiveSheetFilter")
    const postalCode = searchParams.get("postalCode")
    const transactionType = searchParams.get("transactionType")
    
    const whereClause: Prisma.PropertyWhereInput = {}
    
    // Build energy filter conditions
    const energyConditions: Prisma.PropertyEnergyWhereInput = {}
    let hasEnergyFilter = false
    
    // Handle label filter
    if (labelFilter === "generated") {
      energyConditions.labelGenerated = true
      hasEnergyFilter = true
    } else if (labelFilter === "not_generated") {
      whereClause.OR = [
        { energy: null },
        { energy: { labelGenerated: false } }
      ]
    }
    
    // Handle descriptive sheet filter
    if (descriptiveSheetFilter === "generated") {
      energyConditions.descriptiveSheetGenerated = true
      hasEnergyFilter = true
    } else if (descriptiveSheetFilter === "not_generated") {
      // Only set this if no other OR condition is set
      if (!whereClause.OR) {
        whereClause.OR = [
          { energy: null },
          { energy: { descriptiveSheetGenerated: false } }
        ]
      }
    }
    
    // Apply energy conditions if any
    if (hasEnergyFilter) {
      whereClause.energy = energyConditions
    }
    
    // Handle postal code filter
    if (postalCode) {
      whereClause.location = {
        postalCode: postalCode,
      }
    }
    
    // Handle transaction type filter
    if (transactionType) {
      whereClause.transactionType = transactionType as TransactionType
    }
    // "all" or no filter = return all properties (empty where clause)

    const properties = await prisma.property.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
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

    return NextResponse.json(properties)
  } catch (error) {
    console.error("Error fetching properties:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des annonces" },
      { status: 500 }
    )
  }
}

// POST /api/properties - Créer une annonce
export async function POST(request: Request) {
  const authResult = await requireAuth()
  if (!authResult.authenticated) {
    return authResult.response
  }

  try {
    const body = await request.json()
    const userId = authResult.session.user.id

    const {
      finance,
      location,
      characteristics,
      amenities,
      energy,
      copro,
      ...propertyData
    } = body

    // Création avec transaction pour assurer la cohérence
    const property = await prisma.$transaction(async (tx) => {
      // Créer la propriété principale
      const newProperty = await tx.property.create({
        data: {
          title: propertyData.title,
          description: propertyData.description,
          shortDescription: propertyData.shortDescription,
          reference: propertyData.reference,
          propertyType: propertyData.propertyType,
          propertySubType: propertyData.propertySubType,
          transactionType: propertyData.transactionType,
          status: propertyData.status || "DISPONIBLE",
          condition: propertyData.condition,
          standing: propertyData.standing,
          availableFrom: propertyData.availableFrom ? new Date(propertyData.availableFrom) : null,
          isPublished: propertyData.isPublished || false,
          isFeatured: propertyData.isFeatured || false,
          isExclusive: propertyData.isExclusive || false,
          internalNotes: propertyData.internalNotes,
          userId,
        },
      })

      // Créer les sous-tables si les données sont fournies
      if (finance) {
        await tx.propertyFinance.create({
          data: { ...finance, propertyId: newProperty.id },
        })
      }

      if (location) {
        await tx.propertyLocation.create({
          data: { ...location, propertyId: newProperty.id },
        })
      }

      if (characteristics) {
        await tx.propertyCharacteristics.create({
          data: { ...characteristics, propertyId: newProperty.id },
        })
      }

      if (amenities) {
        await tx.propertyAmenities.create({
          data: { ...amenities, propertyId: newProperty.id },
        })
      }

      if (energy) {
        await tx.propertyEnergy.create({
          data: { ...energy, propertyId: newProperty.id },
        })
      }

      if (copro) {
        await tx.propertyCopro.create({
          data: { ...copro, propertyId: newProperty.id },
        })
      }

      return newProperty
    })

    // Récupérer l'annonce complète
    const fullProperty = await prisma.property.findUnique({
      where: { id: property.id },
      include: {
        finance: true,
        location: true,
        characteristics: true,
        amenities: true,
        energy: true,
        copro: true,
        images: true,
      },
    })

    return NextResponse.json(fullProperty, { status: 201 })
  } catch (error) {
    console.error("Error creating property:", error)
    
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "La référence de l'annonce existe déjà" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Erreur lors de la création de l'annonce" },
      { status: 500 }
    )
  }
}
