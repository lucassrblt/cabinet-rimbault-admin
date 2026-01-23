import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { deleteFolderFromStorage, BUCKETS } from "@/lib/supabase";
import { autoGenerateEnergyLabels } from "@/lib/energy-labels/auto-generate";

// GET /api/properties/[id] - Récupérer une annonce par ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth();
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    const { id } = await params;

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
    });

    if (!property) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 },
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error("Error fetching property:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'annonce" },
      { status: 500 },
    );
  }
}

// PUT /api/properties/[id] - Mettre à jour une annonce
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth();
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    const { id } = await params;
    const body = await request.json();

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
    });

    if (!existingProperty) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 },
      );
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
    } = body;

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
          availableFrom: propertyData.availableFrom
            ? new Date(propertyData.availableFrom)
            : null,
          publishedAt: propertyData.publishedAt
            ? new Date(propertyData.publishedAt)
            : null,
          soldAt: propertyData.soldAt ? new Date(propertyData.soldAt) : null,
          isPublished: propertyData.isPublished,
          isFeatured: propertyData.isFeatured,
          isExclusive: propertyData.isExclusive,
          internalNotes: propertyData.internalNotes,
        },
      });

      // Mettre à jour ou créer PropertyFinance
      if (finance) {
        if (existingProperty.finance) {
          await tx.propertyFinance.update({
            where: { propertyId: id },
            data: finance,
          });
        } else {
          await tx.propertyFinance.create({
            data: { ...finance, propertyId: id },
          });
        }
      }

      // Mettre à jour ou créer PropertyLocation
      if (location) {
        if (existingProperty.location) {
          await tx.propertyLocation.update({
            where: { propertyId: id },
            data: location,
          });
        } else {
          await tx.propertyLocation.create({
            data: { ...location, propertyId: id },
          });
        }
      }

      // Mettre à jour ou créer PropertyCharacteristics
      if (characteristics) {
        if (existingProperty.characteristics) {
          await tx.propertyCharacteristics.update({
            where: { propertyId: id },
            data: characteristics,
          });
        } else {
          await tx.propertyCharacteristics.create({
            data: { ...characteristics, propertyId: id },
          });
        }
      }

      // Mettre à jour ou créer PropertyAmenities
      if (amenities) {
        if (existingProperty.amenities) {
          await tx.propertyAmenities.update({
            where: { propertyId: id },
            data: amenities,
          });
        } else {
          await tx.propertyAmenities.create({
            data: { ...amenities, propertyId: id },
          });
        }
      }

      // Mettre à jour ou créer PropertyEnergy
      if (energy) {
        if (existingProperty.energy) {
          await tx.propertyEnergy.update({
            where: { propertyId: id },
            data: energy,
          });
        } else {
          await tx.propertyEnergy.create({
            data: { ...energy, propertyId: id },
          });
        }
      }

      // Mettre à jour ou créer PropertyCopro
      if (copro) {
        if (existingProperty.copro) {
          await tx.propertyCopro.update({
            where: { propertyId: id },
            data: copro,
          });
        } else {
          await tx.propertyCopro.create({
            data: { ...copro, propertyId: id },
          });
        }
      }

      return property;
    });

    // Générer les labels DPE et GES si les données ont changé
    if (
      energy?.energyClass &&
      energy?.energyValue &&
      energy?.gesClass &&
      energy?.gesValue
    ) {
      const shouldGenerateLabels =
        energy.energyClass !== "VIERGE" &&
        energy.gesClass !== "VIERGE" &&
        (existingProperty.energy?.energyClass !== energy.energyClass ||
          existingProperty.energy?.energyValue !== energy.energyValue ||
          existingProperty.energy?.gesClass !== energy.gesClass ||
          existingProperty.energy?.gesValue !== energy.gesValue);

      if (shouldGenerateLabels) {
        console.log(
          `[API PUT] Régénération des labels DPE/GES pour la propriété ${id}...`,
        );
        try {
          const labelResult = await autoGenerateEnergyLabels({
            propertyId: id,
            reference: propertyData.reference,
            energyValue: energy.energyValue,
            energyClass: energy.energyClass,
            gesValue: energy.gesValue,
            gesClass: energy.gesClass,
          });

          if (labelResult.success) {
            console.log(
              `[API PUT] Labels DPE/GES régénérés avec succès pour ${id}`,
            );
          } else {
            console.warn(
              `[API PUT] Échec régénération labels pour ${id}:`,
              labelResult.error,
            );
          }
        } catch (labelError) {
          console.error(
            `[API PUT] Erreur lors de la régénération des labels pour ${id}:`,
            labelError,
          );
          // Ne pas bloquer la mise à jour de la propriété si la génération échoue
        }
      }
    }

    // Récupérer l'annonce complète avec toutes les relations et documents
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
        documents: true,
      },
    });

    return NextResponse.json(fullProperty);
  } catch (error) {
    console.error("Error updating property:", error);

    // Gérer les erreurs de contrainte unique
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "La référence de l'annonce existe déjà" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'annonce" },
      { status: 500 },
    );
  }
}

// DELETE /api/properties/[id] - Supprimer une annonce
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth();
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    const { id } = await params;

    // Vérifier que l'annonce existe et récupérer la référence
    const existingProperty = await prisma.property.findUnique({
      where: { id },
      select: {
        id: true,
        reference: true,
      },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 },
      );
    }

    // Supprimer tous les fichiers du bucket property-files associés à cette annonce
    // Le chemin est property-files/[reference]/
    const deleteResult = await deleteFolderFromStorage(
      BUCKETS.PROPERTY_FILES,
      existingProperty.reference,
    );

    if (!deleteResult.success && deleteResult.errors.length > 0) {
      console.error(
        `Erreurs lors de la suppression des fichiers pour l'annonce ${existingProperty.reference}:`,
        deleteResult.errors,
      );
      // On continue quand même la suppression en base de données
      // car les fichiers peuvent ne pas exister ou avoir déjà été supprimés
    } else if (deleteResult.deletedCount > 0) {
      console.log(
        `✅ ${deleteResult.deletedCount} fichier(s) supprimé(s) du bucket pour l'annonce ${existingProperty.reference}`,
      );
    }

    // Supprimer l'annonce (les sous-tables sont supprimées en cascade)
    // Cela supprime automatiquement :
    // - PropertyFinance
    // - PropertyLocation
    // - PropertyCharacteristics
    // - PropertyAmenities
    // - PropertyEnergy
    // - PropertyCopro
    // - PropertyImage
    // - PropertyDocument
    // - PropertyRoom
    // - PropertyProximity
    await prisma.property.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      deletedFilesCount: deleteResult.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting property:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'annonce" },
      { status: 500 },
    );
  }
}
