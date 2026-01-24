"use client";

import { forwardRef } from "react";

export interface LabelProperty {
  reference: string;
  title: string;
  description: string;
  propertyType: string;
  transactionType: string;
  price: number;
  city: string;
  postalCode: string;
  surface: number;
  surfaceCarrez?: number | null;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  floor?: number | null;
  totalFloors?: number | null;
  surfaceTerrain?: number | null;
  surfaceSejour?: number | null;
  surfaceBalcon?: number | null;
  surfaceCave?: number | null;
  status: string;
  energyClass?: string | null;
  energyValue?: number | null;
  gesClass?: string | null;
  gesValue?: number | null;
  hasBalcony?: boolean;
  hasTerrace?: boolean;
  hasGarden?: boolean;
  hasParking?: boolean;
  hasGarage?: boolean;
  hasCellar?: boolean;
  hasElevator?: boolean;
  hasPool?: boolean;
  honoraires?: number | null;
  honorairesType?: string | null;
  honorairesPct?: number | null;
  heatingType?: string | null;
  heatingEnergy?: string | null;
  isInCopro?: boolean;
  coprLots?: number | null;
  coprCharges?: number | null;
  neighborhood?: string | null;
  dpeImageUrl?: string | null;
  gesImageUrl?: string | null;
  isExclusive?: boolean;
}

interface SelectedPhoto {
  id: string;
  url: string;
  alt?: string | null;
}

interface LabelPreviewProps {
  property: LabelProperty;
  primaryColor?: string;
  propertyImageUrl?: string | null; // Deprecated, use selectedPhotos
  selectedPhotos?: SelectedPhoto[];
}

export const LabelPreview = forwardRef<HTMLDivElement, LabelPreviewProps>(
  (
    {
      property,
      primaryColor = "#2596be",
      propertyImageUrl,
      selectedPhotos = [],
    },
    ref,
  ) => {
    // Use selectedPhotos if provided, fallback to single propertyImageUrl for backwards compatibility
    const mainPhotoUrl =
      selectedPhotos.length > 0 ? selectedPhotos[0]?.url : propertyImageUrl;
    const smallPhotos = selectedPhotos.slice(1, 4);

    const formatPrice = (price: number) => {
      return price.toLocaleString("fr-FR");
    };

    const calculatePriceExcludingFees = () => {
      if (property.honorairesType === "acquereur" && property.honorairesPct) {
        return property.price - (property.honoraires ?? 0);
      }
      return null;
    };

    const priceExcluding = calculatePriceExcludingFees();

    // Description container height (2/3 of available right column space)
    const DESCRIPTION_HEIGHT = 300;
    const DESCRIPTION_WIDTH = 400; // approximate width in pixels
    const LINE_HEIGHT = 1.5;

    // Calculate description font size to fit within container
    const DESCRIPTION_PADDING = 8; // padding-bottom for html2canvas rendering

    const getDescriptionFontSize = (text: string): number => {
      const charCount = text.length;
      const availableHeight = DESCRIPTION_HEIGHT - DESCRIPTION_PADDING;

      // Estimate characters per line and lines needed for different font sizes
      // Then find the largest font size that fits
      const fontSizes = [22, 20, 18, 16, 15, 14, 13, 12, 11, 10, 9];

      for (const fontSize of fontSizes) {
        const charsPerLine = Math.floor(DESCRIPTION_WIDTH / (fontSize * 0.58));
        const lineHeightPx = fontSize * LINE_HEIGHT;
        // Use available height minus padding, then subtract one line for safety
        const maxLines = Math.floor(availableHeight / lineHeightPx) - 1;
        const maxChars = charsPerLine * maxLines;

        if (charCount <= maxChars) {
          return fontSize;
        }
      }

      return 9; // minimum font size
    };

    const descriptionFontSize = getDescriptionFontSize(property.description);

    // A4 Landscape proportions: 297mm x 210mm (ratio ~1.41)
    return (
      <div
        ref={ref}
        style={{
          width: "891px", // A4 landscape width at 96dpi (297mm)
          height: "630px", // A4 landscape height at 96dpi (210mm)
          backgroundColor: "#ffffff",
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header Band */}
        <div
          style={{
            backgroundColor: primaryColor,
            padding: "10px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              color: "#ffffff",
              fontSize: "24px",
              fontWeight: 700,
              fontStyle: "italic",
            }}
          >
            A vendre
          </span>
          <span style={{ color: "#ffffff", fontSize: "9px", fontWeight: 500 }}>
            Réf {property.reference}
          </span>
        </div>

        {/* Main Content */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Left Column - Photos */}
          <div
            style={{
              width: "50%",
              display: "flex",
              flexDirection: "column",
              padding: "15px",
            }}
          >
            {/* Property Title */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0px",
              }}
            >
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#000",
                  marginBottom: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.3px",
                  lineHeight: 1.3,
                }}
              >
                {property.city}
              </div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: primaryColor,
                  marginBottom: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.3px",
                  lineHeight: 1.3,
                }}
              >
                {property.title}
              </div>
            </div>

            {/* Main Photo */}
            <div
              style={{
                width: "100%",
                height: "320px",
                borderRadius: "8px",
                overflow: "hidden",
                background: mainPhotoUrl
                  ? `url(${mainPhotoUrl}) center/cover no-repeat`
                  : "linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6c757d",
                fontSize: "14px",
                position: "relative",
                marginBottom: "10px",
              }}
            >
              {!mainPhotoUrl && (
                <span style={{ fontSize: "32px", opacity: 0.5 }}>
                  📷 Photo du bien
                </span>
              )}
            </div>

            {/* Small Photos Row */}
            <div style={{ display: "flex", gap: "8px" }}>
              {[0, 1, 2].map((index) => {
                const photo = smallPhotos[index];
                return (
                  <div
                    key={index}
                    style={{
                      flex: 1,
                      aspectRatio: "4/3",
                      borderRadius: "6px",
                      overflow: "hidden",
                      background: photo?.url
                        ? `url(${photo.url}) center/cover no-repeat`
                        : "linear-gradient(135deg, #f0f0f0 0%, #e5e5e5 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#adb5bd",
                      fontSize: "10px",
                    }}
                  >
                    {!photo?.url && <span>📷</span>}
                  </div>
                );
              })}
            </div>

            {/* Géorisques Notice */}
            <div
              style={{
                marginTop: "10px",
                fontSize: "7px",
                color: "#6c757d",
                lineHeight: 1.4,
              }}
            >
              Les informations sur les risques auxquels ce bien est exposé sont
              disponibles sur le site Géorisques : www.georisques.gouv.fr
            </div>
          </div>

          {/* Right Column - Info */}
          <div
            style={{
              width: "50%",
              padding: "15px 20px",
              backgroundColor: "#ffffff",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Description Section */}
            <div
              style={{
                overflow: "hidden",
                maxHeight: `${DESCRIPTION_HEIGHT}px`,
                marginBottom: "12px",
                paddingBottom: "8px",
              }}
            >
              <p
                style={{
                  fontSize: `${descriptionFontSize}px`,
                  lineHeight: LINE_HEIGHT,
                  color: "#000000",
                  textAlign: "justify",
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                {property.description}
              </p>
            </div>

            {/* Price Section */}
            <div style={{ flexShrink: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: 700,
                    color: primaryColor,
                  }}
                >
                  {formatPrice(property.price)} €
                </div>
                {property.isExclusive && (
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: 700,
                      color: "#dc2626",
                      marginLeft: "0px",
                    }}
                  >
                    Exclusivité !
                  </div>
                )}
              </div>
              {property.honorairesType === "acquereur" && priceExcluding ? (
                <>
                  <div
                    style={{
                      fontSize: "9px",
                      color: "#000000",
                      marginTop: "4px",
                    }}
                  >
                    soit {priceExcluding.toLocaleString("fr-FR")} € honoraires
                    exclus
                  </div>
                  <div
                    style={{
                      fontSize: "9px",
                      color: "#000000",
                      marginTop: "2px",
                    }}
                  >
                    Honoraires de {property.honorairesPct}% TTC à la charge de
                    l&apos;acquéreur
                  </div>
                </>
              ) : (
                <div
                  style={{
                    fontSize: "9px",
                    color: "#000000",
                    marginTop: "4px",
                  }}
                >
                  Honoraires à la charge du vendeur
                </div>
              )}
            </div>

            {/* DPE/GES Images Section */}
            {(property.dpeImageUrl || property.gesImageUrl) && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-end",
                  gap: "30px",
                  paddingTop: "10px",
                  marginTop: "auto",
                }}
              >
                {property.dpeImageUrl && (
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "8px",
                        color: "#6c757d",
                        marginBottom: "4px",
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}
                    >
                      DPE
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={property.dpeImageUrl}
                      alt="Étiquette DPE"
                      style={{
                        height: "160px",
                        width: "auto",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                )}
                {property.gesImageUrl && (
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "8px",
                        color: "#6c757d",
                        marginBottom: "4px",
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}
                    >
                      GES
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={property.gesImageUrl}
                      alt="Étiquette GES"
                      style={{
                        height: "160px",
                        width: "auto",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

LabelPreview.displayName = "LabelPreview";
