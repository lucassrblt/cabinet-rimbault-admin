import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { EnergyClass } from "@prisma/client";
import { upsertPropertyDocument } from "@/lib/documents";
import { autoGenerateEnergyLabels } from "@/lib/energy-labels";

interface GenerateLabelRequest {
  propertyId: string;
  selectedPhotoIds?: string[]; // Array of selected photo IDs in order
  selectedImageIndex?: number; // Deprecated, for backwards compatibility
  primaryColor: string;
  // Optional: use pre-generated energy images
  previewDpeUrl?: string;
  previewGesUrl?: string;
  // Optional: updated energy values
  energyValue?: number;
  energyClass?: EnergyClass;
  gesValue?: number;
  gesClass?: EnergyClass;
  finalEnergyValue?: number | null;
}

export async function POST(request: Request) {
  // Vérification de l'authentification
  const authResult = await requireAuth();
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    const body: GenerateLabelRequest = await request.json();
    const {
      propertyId,
      selectedPhotoIds,
      selectedImageIndex, // Deprecated, for backwards compatibility
      primaryColor,
      previewDpeUrl,
      previewGesUrl,
      energyValue: customEnergyValue,
      energyClass: customEnergyClass,
      gesValue: customGesValue,
      gesClass: customGesClass,
      finalEnergyValue: customFinalEnergyValue,
    } = body;

    // Fetch property with images and energy data
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        energy: true,
        finance: true,
        location: true,
        characteristics: true,
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 },
      );
    }

    // Use custom values if provided, otherwise use property energy values
    const resolvedEnergyValue = customEnergyValue ?? property.energy?.energyValue;
    const resolvedEnergyClass = customEnergyClass ?? property.energy?.energyClass;
    const resolvedGesValue = customGesValue ?? property.energy?.gesValue;
    const resolvedGesClass = customGesClass ?? property.energy?.gesClass;
    const resolvedFinalEnergyValue =
      customFinalEnergyValue ?? property.energy?.finalEnergyValue ?? null;

    // Validate DPE and GES data
    if (!resolvedEnergyClass || !resolvedEnergyValue) {
      return NextResponse.json(
        { error: "Les données DPE sont requises pour générer l'étiquette" },
        { status: 400 },
      );
    }

    if (!resolvedGesClass || !resolvedGesValue) {
      return NextResponse.json(
        { error: "Les données GES sont requises pour générer l'étiquette" },
        { status: 400 },
      );
    }

    let dpeUrl = previewDpeUrl;
    let gesUrl = previewGesUrl;

    // Pas d'étiquette existante : on la génère localement en SVG et on
    // l'enregistre (upload + PropertyDocument) via le pipeline partagé.
    if (!dpeUrl || !gesUrl) {
      const generated = await autoGenerateEnergyLabels({
        propertyId,
        reference: property.reference,
        energyValue: resolvedEnergyValue,
        energyClass: resolvedEnergyClass,
        gesValue: resolvedGesValue,
        gesClass: resolvedGesClass,
        finalEnergyValue: resolvedFinalEnergyValue,
      });

      if (!generated.success) {
        return NextResponse.json(
          {
            error:
              generated.error ?? "Impossible de générer les étiquettes DPE/GES",
          },
          { status: 500 },
        );
      }

      dpeUrl = generated.dpeImageUrl;
      gesUrl = generated.gesImageUrl;
    }

    // Get selected photos
    let selectedPhotos: { id: string; url: string; alt?: string | null }[] = [];

    if (selectedPhotoIds && selectedPhotoIds.length > 0) {
      // Use new selectedPhotoIds array
      selectedPhotos = selectedPhotoIds
        .map((id) => property.images.find((img) => img.id === id))
        .filter((img): img is (typeof property.images)[0] => img !== undefined)
        .map((img) => ({ id: img.id, url: img.url, alt: img.alt }));
    } else if (selectedImageIndex !== undefined) {
      // Backwards compatibility: use selectedImageIndex
      const selectedImage =
        property.images[selectedImageIndex] || property.images[0];
      if (selectedImage) {
        selectedPhotos = [
          {
            id: selectedImage.id,
            url: selectedImage.url,
            alt: selectedImage.alt,
          },
        ];
      }
    }

    // Les étiquettes fraîchement générées sont déjà enregistrées par
    // autoGenerateEnergyLabels ; on n'enregistre ici que les URLs d'aperçu
    // fournies par l'appelant.
    if (previewDpeUrl && dpeUrl) {
      await upsertPropertyDocument({
        propertyId,
        type: "DPE_IMAGE",
        url: dpeUrl,
        name: `${property.reference}_dpe.svg`,
        mimeType: "image/svg+xml",
        description: `Étiquette DPE - Classe ${resolvedEnergyClass} (${resolvedEnergyValue} kWh/m²/an)`,
      });
    }

    if (previewGesUrl && gesUrl) {
      await upsertPropertyDocument({
        propertyId,
        type: "GES_IMAGE",
        url: gesUrl,
        name: `${property.reference}_ges.svg`,
        mimeType: "image/svg+xml",
        description: `Étiquette GES - Classe ${resolvedGesClass} (${resolvedGesValue} kg CO₂/m²/an)`,
      });
    }

    // Update property energy data (metadata only, not URLs).
    // Upsert plutôt que update/create : autoGenerateEnergyLabels a pu créer
    // la ligne entre-temps, ce qui ferait échouer un create.
    const energyMetadata = {
      energyValue: resolvedEnergyValue,
      energyClass: resolvedEnergyClass,
      gesValue: resolvedGesValue,
      gesClass: resolvedGesClass,
      finalEnergyValue: resolvedFinalEnergyValue,
      labelGenerated: true,
      labelGeneratedAt: new Date(),
      labelColor: primaryColor,
    };

    await prisma.propertyEnergy.upsert({
      where: { propertyId: propertyId },
      update: energyMetadata,
      create: { propertyId: propertyId, ...energyMetadata },
    });

    // Fetch updated property with documents
    const updatedProperty = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        energy: true,
        finance: true,
        location: true,
        characteristics: true,
        documents: true,
      },
    });

    // Return label data for PDF generation on client
    // The client will generate the PDF and call the upload-pdf endpoint
    return NextResponse.json({
      success: true,
      property: updatedProperty,
      labelData: {
        dpeImageUrl: dpeUrl,
        gesImageUrl: gesUrl,
        selectedPhotos,
        primaryColor,
      },
    });
  } catch (error) {
    console.error("Error generating label:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération de l'étiquette" },
      { status: 500 },
    );
  }
}
