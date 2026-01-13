import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-auth"

// GET /api/properties/[id] - Récupérer une annonce par ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth()
  if (!authResult.authenticated) {
    return authResult.response
  }

  try {
    const { id } = await params

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        finance: true,
        location: true,
        characteristics: true,
        amenities: true,
        energy: true,
        copro: true,
        images: {
          orderBy: { order: "asc" },
        },
        documents: true,
        rooms_details: {
          orderBy: { order: "asc" },
        },
        proximities: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!property) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 }
      )
    }

    return NextResponse.json(property)
  } catch (error) {
    console.error("Error fetching property:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'annonce" },
      { status: 500 }
    )
  }
}

// PUT /api/properties/[id] - Mettre à jour une annonce
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth()
  if (!authResult.authenticated) {
    return authResult.response
  }

  try {
    const { id } = await params
    const body = await request.json()

    // Vérifier que l'annonce existe
    const existingProperty = await prisma.property.findUnique({
      where: { id },
      include: {
        finance: true,
        location: true,
        characteristics: true,
        amenities: true,
        energy: true,
        copro: true,
      },
    })

    if (!existingProperty) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 }
      )
    }

    // Extraire les données des différentes tables
    const {
      finance,
      location,
      characteristics,
      amenities,
      energy,
      copro,
      ...propertyData
    } = body

    // Mise à jour avec transaction pour assurer la cohérence
    const updatedProperty = await prisma.$transaction(async (tx) => {
      // Mettre à jour la table principale
      const property = await tx.property.update({
        where: { id },
        data: {
          title: propertyData.title,
          description: propertyData.description,
          shortDescription: propertyData.shortDescription,
          reference: propertyData.reference,
          propertyType: propertyData.propertyType,
          propertySubType: propertyData.propertySubType,
          transactionType: propertyData.transactionType,
          status: propertyData.status,
          condition: propertyData.condition,
          standing: propertyData.standing,
          availableFrom: propertyData.availableFrom ? new Date(propertyData.availableFrom) : null,
          publishedAt: propertyData.publishedAt ? new Date(propertyData.publishedAt) : null,
          soldAt: propertyData.soldAt ? new Date(propertyData.soldAt) : null,
          isPublished: propertyData.isPublished,
          isFeatured: propertyData.isFeatured,
          isExclusive: propertyData.isExclusive,
          internalNotes: propertyData.internalNotes,
        },
      })

      // Mettre à jour ou créer PropertyFinance
      if (finance) {
        if (existingProperty.finance) {
          await tx.propertyFinance.update({
            where: { propertyId: id },
            data: finance,
          })
        } else {
          await tx.propertyFinance.create({
            data: { ...finance, propertyId: id },
          })
        }
      }

      // Mettre à jour ou créer PropertyLocation
      if (location) {
        if (existingProperty.location) {
          await tx.propertyLocation.update({
            where: { propertyId: id },
            data: location,
          })
        } else {
          await tx.propertyLocation.create({
            data: { ...location, propertyId: id },
          })
        }
      }

      // Mettre à jour ou créer PropertyCharacteristics
      if (characteristics) {
        if (existingProperty.characteristics) {
          await tx.propertyCharacteristics.update({
            where: { propertyId: id },
            data: characteristics,
          })
        } else {
          await tx.propertyCharacteristics.create({
            data: { ...characteristics, propertyId: id },
          })
        }
      }

      // Mettre à jour ou créer PropertyAmenities
      if (amenities) {
        if (existingProperty.amenities) {
          await tx.propertyAmenities.update({
            where: { propertyId: id },
            data: amenities,
          })
        } else {
          await tx.propertyAmenities.create({
            data: { ...amenities, propertyId: id },
          })
        }
      }

      // Mettre à jour ou créer PropertyEnergy
      if (energy) {
        if (existingProperty.energy) {
          await tx.propertyEnergy.update({
            where: { propertyId: id },
            data: energy,
          })
        } else {
          await tx.propertyEnergy.create({
            data: { ...energy, propertyId: id },
          })
        }
      }

      // Mettre à jour ou créer PropertyCopro
      if (copro) {
        if (existingProperty.copro) {
          await tx.propertyCopro.update({
            where: { propertyId: id },
            data: copro,
          })
        } else {
          await tx.propertyCopro.create({
            data: { ...copro, propertyId: id },
          })
        }
      }

      return property
    })

    // Récupérer l'annonce complète avec toutes les relations
    const fullProperty = await prisma.property.findUnique({
      where: { id: updatedProperty.id },
      include: {
        finance: true,
        location: true,
        characteristics: true,
        amenities: true,
        energy: true,
        copro: true,
        images: {
          orderBy: { order: "asc" },
        },
      },
    })

    return NextResponse.json(fullProperty)
  } catch (error) {
    console.error("Error updating property:", error)
    
    // Gérer les erreurs de contrainte unique
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "La référence de l'annonce existe déjà" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'annonce" },
      { status: 500 }
    )
  }
}

// DELETE /api/properties/[id] - Supprimer une annonce
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth()
  if (!authResult.authenticated) {
    return authResult.response
  }

  try {
    const { id } = await params

    // Vérifier que l'annonce existe
    const existingProperty = await prisma.property.findUnique({
      where: { id },
    })

    if (!existingProperty) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 }
      )
    }

    // Supprimer l'annonce (les sous-tables sont supprimées en cascade)
    await prisma.property.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting property:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'annonce" },
      { status: 500 }
    )
  }
}

