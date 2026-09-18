"use client";

import { forwardRef } from "react";

import { buildEnergyCostNotice } from "@/lib/energy-cost-notice";

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
  /** Dépenses annuelles estimées, abonnements compris (mention légale). */
  annualEnergyCostMin?: number | null;
  annualEnergyCostMax?: number | null;
  /** Date d'indexation des prix de l'énergie, ou à défaut date du DPE. */
  energyPriceReferenceDate?: string | Date | null;
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

    // Mention obligatoire des dépenses annuelles d'énergie (CCH, art. R126-23),
    // composée par le module partagé avec la fiche descriptive.
    const energyCostNotice = buildEnergyCostNotice({
      annualEnergyCostMin: property.annualEnergyCostMin,
      annualEnergyCostMax: property.annualEnergyCostMax,
      referenceDate: property.energyPriceReferenceDate,
    });

    const calculatePriceExcludingFees = () => {
      if (property.honorairesType === "acquereur" && property.honorairesPct) {
        return property.price - (property.honoraires ?? 0);
      }
      return null;
    };

    const priceExcluding = calculatePriceExcludingFees();

    // Budget vertical de la colonne droite, pour 630px de page :
    //   bandeau 49px + bande légale 53px → 498px utiles après paddings.
    //   étiquettes 172px + prix 60px + description 250px = 482px, soit 16px
    //   de marge. Ces valeurs doivent rester cohérentes entre elles : c'est
    //   leur désaccord qui avait fait disparaître la description.
    const DESCRIPTION_HEIGHT = 230;
    const DESCRIPTION_WIDTH = 400; // approximate width in pixels
    const LINE_HEIGHT = 1.5;
    /** Plafond de hauteur d'une étiquette, intitulé non compris. */
    const LABEL_MAX_HEIGHT = 150;

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
                // `overflow: hidden` laisse flexbox résoudre la hauteur
                // minimale à zéro : sans ce `flexShrink`, la description est le
                // seul bloc compressible de la colonne, donc le premier
                // sacrifié, et elle disparaît sans aucun signe visible.
                flexShrink: 0,
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
                    Honoraires de{" "}
                    {property.honorairesPct?.toString().replace(".", ",")}% TTC
                    à la charge de l&apos;acquéreur
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
                  // Étiquettes côte à côte. Empilées, elles réclamaient 613px
                  // dans une colonne qui n'en offre que ~520 : la description
                  // était alors écrasée à zéro et la GES rognée. Côte à côte,
                  // le bloc retombe à ~160px.
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "flex-end",
                  gap: "10px",
                  paddingTop: "10px",
                  marginTop: "auto",
                  flexShrink: 0,
                }}
              >
                {property.dpeImageUrl && (
                  <div style={{ textAlign: "center", flex: 1, minWidth: 0 }}>
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
                        width: "100%",
                        // Plafond de hauteur explicite : c'est le garde-fou que
                        // la refonte du gabarit avait retiré. Sans lui, la mise
                        // en page dépend du rapport de forme du SVG, et tout
                        // changement de gabarit casse la page en silence.
                        maxHeight: `${LABEL_MAX_HEIGHT}px`,
                        height: "auto",
                        objectFit: "contain",
                      }}
                      /* Requis par html2canvas (useCORS) pour photographier
                         un SVG servi par Supabase sans salir le canvas. */
                      crossOrigin="anonymous"
                    />
                  </div>
                )}
                {property.gesImageUrl && (
                  <div style={{ textAlign: "center", flex: 1, minWidth: 0 }}>
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
                        width: "100%",
                        // Plafond de hauteur explicite : c'est le garde-fou que
                        // la refonte du gabarit avait retiré. Sans lui, la mise
                        // en page dépend du rapport de forme du SVG, et tout
                        // changement de gabarit casse la page en silence.
                        maxHeight: `${LABEL_MAX_HEIGHT}px`,
                        height: "auto",
                        objectFit: "contain",
                      }}
                      /* Requis par html2canvas (useCORS) pour photographier
                         un SVG servi par Supabase sans salir le canvas. */
                      crossOrigin="anonymous"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bande des mentions légales, pleine largeur.
            Placées ici et non dans une colonne : la mention des dépenses
            d'énergie tient sur une ligne au lieu de trois, et elle ne prend
            plus la place du contenu commercial. */}
        <div
          style={{
            flexShrink: 0,
            // 28px de marge basse, et non 10 : l'affiche est glissée dans un
            // cadre en vitrine dont la bordure masquait le bas de la feuille,
            // donc la mention obligatoire. Comme la zone à deux colonnes
            // occupe l'espace restant, ce seul réglage remonte la bande de
            // 18px : elle vient à ~5px sous les photos et libère autant de
            // place en bas.
            padding: "0 15px 28px",
            display: "flex",
            flexDirection: "column",
            gap: "3px",
          }}
        >
          {energyCostNotice && (
            // Corps de 9px, celui du texte courant de l'affiche : la loi impose
            // une taille au moins égale au reste de l'annonce (CCH, art.
            // R126-23), donc pas le 7px de la mention Géorisques.
            <div
              style={{
                fontSize: "9px",
                color: "#212529",
                lineHeight: 1.35,
              }}
            >
              {energyCostNotice}
            </div>
          )}

          <div
            style={{
              fontSize: "7px",
              color: "#6c757d",
              lineHeight: 1.35,
            }}
          >
            Les informations sur les risques auxquels ce bien est exposé sont
            disponibles sur le site Géorisques : www.georisques.gouv.fr
          </div>
        </div>
      </div>
    );
  },
);

LabelPreview.displayName = "LabelPreview";
