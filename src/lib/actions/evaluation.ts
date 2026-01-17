"use server";

export interface EstimationData {
  // Étape 1
  propertyType: string;
  postalCode: string;

  // Étape 2
  surface: string;
  levels: string;
  rooms: string;
  bedrooms: string;
  bathrooms: string;

  // Étape 3
  constructionYear: string;
  renovations: string;
  hasGarage: boolean;
  hasParking?: boolean; // Optionnel, sera mappé à hasGarage
  hasPool: boolean;
  hasGarden: boolean;
  hasBalcony: boolean;
  hasTerrace: boolean;

  // Étape 4
  situation: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Optionnel
  address?: string;
}

/**
 * Server action pour soumettre une demande d'estimation
 * @param data - Les données du formulaire d'estimation
 * @returns Promise contenant la réponse de l'API
 */
export async function submitEvaluation(
  data: EstimationData
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    // Construire l'URL de l'API (route locale Next.js)
    const url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/api/evaluations`;

    // Préparer les données en mappant hasParking à hasGarage si nécessaire
    const payload = {
      ...data,
      hasGarage: data.hasGarage || data.hasParking || false, // Mapper hasParking à hasGarage
    };
    
    // Supprimer hasParking du payload si présent
    delete (payload as any).hasParking;

    // Appeler l'API locale Next.js
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `Failed to submit evaluation: ${response.status} ${response.statusText}`,
      }));

      return {
        success: false,
        error: errorData.error || `Failed to submit evaluation: ${response.status}`,
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error("Error submitting evaluation:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred",
    };
  }
}

