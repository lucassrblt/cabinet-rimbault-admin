import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToStorage, BUCKETS } from "@/lib/supabase";
import { requireAuth } from "@/lib/api-auth";
import { EnergyClass } from "@prisma/client";
import { upsertPropertyDocument } from "@/lib/documents";

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
}

/**
 * Fetch DPE or GES image from outils.immo API
 */
async function fetchEnergyImage(
  type: "dpe" | "ges",
  value: number,
  letter: string,
): Promise<ArrayBuffer | null> {
  const modele = "2021";
  const apiUrl = `https://www.outils.immo/outils-immo.php?type=${type}&modele=${modele}&valeur=${value}&lettre=${letter.toLowerCase()}`;

  try {
    // Créer un objet Headers explicite pour s'assurer que les headers sont bien passés
    const headers = new Headers();
    headers.set(
      "User-Agent",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );
    headers.set("Referer", "https://www.outils.immo/");
    headers.set(
      "Accept",
      "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    );
    headers.set("Accept-Language", "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7");
    headers.set("Origin", "https://www.outils.immo");

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: headers,
      // Désactiver le cache pour éviter les problèmes
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      console.error(`Failed to fetch ${type} image:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText,
      });
      return null;
    }
    return await response.arrayBuffer();
  } catch (error) {
    console.error(`Error fetching ${type} image:`, error);
    return null;
  }
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
    const finalEnergyValue = customEnergyValue ?? property.energy?.energyValue;
    const finalEnergyClass = customEnergyClass ?? property.energy?.energyClass;
    const finalGesValue = customGesValue ?? property.energy?.gesValue;
    const finalGesClass = customGesClass ?? property.energy?.gesClass;

    // Validate DPE and GES data
    if (!finalEnergyClass || !finalEnergyValue) {
      return NextResponse.json(
        { error: "Les données DPE sont requises pour générer l'étiquette" },
        { status: 400 },
      );
    }

    if (!finalGesClass || !finalGesValue) {
      return NextResponse.json(
        { error: "Les données GES sont requises pour générer l'étiquette" },
        { status: 400 },
      );
    }

    let dpeUrl = previewDpeUrl;
    let gesUrl = previewGesUrl;

    // If no preview URLs provided, fetch fresh images
    if (!dpeUrl || !gesUrl) {
      // Fetch DPE image
      const dpeImageBuffer = await fetchEnergyImage(
        "dpe",
        finalEnergyValue,
        finalEnergyClass,
      );

      // Fetch GES image
      const gesImageBuffer = await fetchEnergyImage(
        "ges",
        finalGesValue,
        finalGesClass,
      );

      if (!dpeImageBuffer || !gesImageBuffer) {
        return NextResponse.json(
          { error: "Impossible de récupérer les images DPE/GES" },
          { status: 500 },
        );
      }

      // Upload DPE image to PROPERTY_FILES bucket in energy folder
      const timestamp = Date.now();
      const dpeFileName = `${property.reference}/energy/${property.reference}_dpe_${timestamp}.png`;
      const { url: uploadedDpeUrl, error: dpeError } = await uploadToStorage(
        BUCKETS.PROPERTY_FILES,
        dpeFileName,
        dpeImageBuffer,
        "image/png",
      );

      if (dpeError) {
        console.error("Error uploading DPE image:", dpeError);
      }
      dpeUrl = uploadedDpeUrl ?? undefined;

      // Upload GES image to PROPERTY_FILES bucket in energy folder
      const gesFileName = `${property.reference}/energy/${property.reference}_ges_${timestamp}.png`;
      const { url: uploadedGesUrl, error: gesError } = await uploadToStorage(
        BUCKETS.PROPERTY_FILES,
        gesFileName,
        gesImageBuffer,
        "image/png",
      );

      if (gesError) {
        console.error("Error uploading GES image:", gesError);
      }
      gesUrl = uploadedGesUrl ?? undefined;
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

    // Store DPE/GES images in PropertyDocument table
    if (dpeUrl) {
      await upsertPropertyDocument({
        propertyId,
        type: "DPE_IMAGE",
        url: dpeUrl,
        name: `${property.reference}_dpe.png`,
        mimeType: "image/png",
        description: `Étiquette DPE - Classe ${finalEnergyClass} (${finalEnergyValue} kWh/m²/an)`,
      });
    }

    if (gesUrl) {
      await upsertPropertyDocument({
        propertyId,
        type: "GES_IMAGE",
        url: gesUrl,
        name: `${property.reference}_ges.png`,
        mimeType: "image/png",
        description: `Étiquette GES - Classe ${finalGesClass} (${finalGesValue} kg CO₂/m²/an)`,
      });
    }

    // Update property energy data (metadata only, not URLs)
    if (property.energy) {
      await prisma.propertyEnergy.update({
        where: { propertyId: propertyId },
        data: {
          energyValue: finalEnergyValue,
          energyClass: finalEnergyClass,
          gesValue: finalGesValue,
          gesClass: finalGesClass,
          labelGenerated: true,
          labelGeneratedAt: new Date(),
          labelColor: primaryColor,
        },
      });
    } else {
      await prisma.propertyEnergy.create({
        data: {
          propertyId: propertyId,
          energyValue: finalEnergyValue,
          energyClass: finalEnergyClass,
          gesValue: finalGesValue,
          gesClass: finalGesClass,
          labelGenerated: true,
          labelGeneratedAt: new Date(),
          labelColor: primaryColor,
        },
      });
    }

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
