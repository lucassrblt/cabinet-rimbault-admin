"use client";

import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react";

import { buildEnergyCostNotice } from "@/lib/energy-cost-notice";
import { labelDisplayFont, labelTextFont } from "@/lib/fonts/label-fonts";
import { splitLeadIn } from "@/lib/label-lead-in";

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

    const { lead, rest } = splitLeadIn(property.description, property.title);

    // Taille de la description, mesurée et non estimée : on part du plafond et
    // on descend jusqu'à ce que le texte tienne dans la hauteur réellement
    // libre de la colonne. L'ancienne estimation (caractères par ligne calés
    // sur Helvetica) se trompait dès qu'on changeait de police ou de gabarit.
    // La mention des dépenses d'énergie suit la même taille : la loi la veut
    // au moins aussi grande que le texte de l'annonce (CCH, art. R126-23).
    const descriptionBoxRef = useRef<HTMLDivElement>(null);
    const descriptionRef = useRef<HTMLParagraphElement>(null);
    const noticeRef = useRef<HTMLDivElement>(null);
    const [textSize, setTextSize] = useState(DESCRIPTION_MAX_SIZE);
    const [fontsReady, setFontsReady] = useState(0);

    useEffect(() => {
      let cancelled = false;
      document.fonts?.ready.then(() => {
        if (!cancelled) setFontsReady((n) => n + 1);
      });
      return () => {
        cancelled = true;
      };
    }, []);

    useLayoutEffect(() => {
      const box = descriptionBoxRef.current;
      const text = descriptionRef.current;
      if (!box || !text) return;

      const notice = noticeRef.current;
      let size = DESCRIPTION_MAX_SIZE;
      for (; size > DESCRIPTION_MIN_SIZE; size -= DESCRIPTION_SIZE_STEP) {
        text.style.fontSize = `${size}px`;
        if (notice) notice.style.fontSize = `${size}px`;
        if (text.offsetHeight <= box.clientHeight) break;
      }
      size = Math.max(size, DESCRIPTION_MIN_SIZE);
      text.style.fontSize = `${size}px`;
      if (notice) notice.style.fontSize = `${size}px`;
      setTextSize(size);
    }, [
      property.description,
      property.title,
      property.city,
      energyCostNotice,
      priceExcluding,
      property.isExclusive,
      property.dpeImageUrl,
      property.gesImageUrl,
      fontsReady,
    ]);

    const display = labelDisplayFont.style.fontFamily;
    const body = labelTextFont.style.fontFamily;
    const rule = tint(primaryColor, 0.3);

    const labels = [
      { key: "DPE", url: property.dpeImageUrl, alt: "Étiquette DPE" },
      { key: "GES", url: property.gesImageUrl, alt: "Étiquette GES" },
    ].filter((label) => label.url);

    // A4 paysage : 297 × 210 mm, soit 891 × 630 px à 96 dpi.
    return (
      <div
        ref={ref}
        lang="fr"
        style={{
          width: "891px",
          height: "630px",
          backgroundColor: "#ffffff",
          fontFamily: body,
          color: INK_TEXT,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Bandeau */}
        <div
          style={{
            backgroundColor: primaryColor,
            height: "46px",
            padding: "0 22px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              color: "#ffffff",
              fontFamily: display,
              fontSize: "40px",
              fontWeight: 700,
              fontStyle: "italic",
              lineHeight: 1,
            }}
          >
            A vendre
          </span>
          <span style={{ color: "#ffffff", fontSize: "13px" }}>
            Réf {property.reference}
          </span>
        </div>

        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          {/* Colonne gauche : ville, titre, photos */}
          <div
            style={{
              width: "472px",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              padding: "16px 14px 0 20px",
            }}
          >
            <div
              style={{
                fontFamily: display,
                fontSize: "30px",
                fontWeight: 700,
                color: INK_TITLE,
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              {property.city}
            </div>
            <div
              style={{
                width: "140px",
                height: "3px",
                backgroundColor: tint(primaryColor, 0.55),
                margin: "7px 0 9px",
              }}
            />
            <div
              style={{
                fontFamily: display,
                fontSize: "30px",
                fontWeight: 700,
                color: primaryColor,
                textTransform: "uppercase",
                lineHeight: 1.02,
                marginBottom: "10px",
              }}
            >
              {property.title}
            </div>

            {/* La photo principale prend la hauteur restante : un titre sur
                deux lignes la raccourcit au lieu de faire déborder la page. */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                borderRadius: "10px",
                background: mainPhotoUrl
                  ? `url(${mainPhotoUrl}) center/cover no-repeat`
                  : "linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "8px",
              }}
            >
              {!mainPhotoUrl && (
                <span style={{ fontSize: "32px", opacity: 0.5 }}>
                  📷 Photo du bien
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
              {[0, 1, 2].map((index) => {
                const photo = smallPhotos[index];
                return (
                  <div
                    key={index}
                    style={{
                      flex: 1,
                      aspectRatio: "6/5",
                      borderRadius: "8px",
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

          {/* Colonne droite : description, prix, étiquettes */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              margin: "16px 0 0",
              padding: "0 22px 0 16px",
              borderLeft: `1px solid ${rule}`,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Zone élastique : elle prend toute la hauteur laissée par le
                prix et les étiquettes, et la taille du texte s'y ajuste. */}
            <div
              ref={descriptionBoxRef}
              style={{ flex: 1, minHeight: 0, overflow: "hidden" }}
            >
              <p
                ref={descriptionRef}
                style={{
                  fontSize: `${textSize}px`,
                  lineHeight: 1.36,
                  textAlign: "justify",
                  margin: 0,
                }}
              >
                {lead && (
                  <strong style={{ color: primaryColor, fontWeight: 700 }}>
                    {lead}
                  </strong>
                )}
                {rest}
              </p>
            </div>

            <div style={{ height: "1px", backgroundColor: rule, margin: "10px 0", flexShrink: 0 }} />

            <div style={{ flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "14px" }}>
                <span
                  style={{
                    fontFamily: display,
                    fontSize: "50px",
                    fontWeight: 700,
                    color: primaryColor,
                    lineHeight: 1,
                  }}
                >
                  {formatPrice(property.price)} €
                </span>
                {property.isExclusive && (
                  <span
                    style={{
                      fontFamily: display,
                      fontSize: "30px",
                      fontWeight: 700,
                      color: "#dc2626",
                      lineHeight: 1,
                    }}
                  >
                    Exclusivité !
                  </span>
                )}
              </div>
              <div style={{ fontSize: "12.5px", lineHeight: 1.3, marginTop: "4px" }}>
                {property.honorairesType === "acquereur" && priceExcluding ? (
                  <>
                    <div>
                      soit {priceExcluding.toLocaleString("fr-FR")} € honoraires
                      exclus
                    </div>
                    <div>
                      Honoraires de{" "}
                      {property.honorairesPct?.toString().replace(".", ",")}% TTC
                      à la charge de l&apos;acquéreur
                    </div>
                  </>
                ) : (
                  <div>Honoraires à la charge du vendeur</div>
                )}
              </div>
            </div>

            {labels.length > 0 && (
              <>
                <div style={{ height: "1px", backgroundColor: rule, margin: "10px 0", flexShrink: 0 }} />
                <div style={{ display: "flex", flexShrink: 0 }}>
                  {labels.map((label, index) => (
                    <div
                      key={label.key}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        paddingLeft: index > 0 ? "14px" : 0,
                        paddingRight: index === 0 && labels.length > 1 ? "14px" : 0,
                        borderLeft: index > 0 ? `1px solid ${rule}` : "none",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={label.url ?? undefined}
                        alt={label.alt}
                        style={{
                          display: "block",
                          // Dimensions `auto` bornées, et non `width: 100%` +
                          // `object-fit` : html2canvas ignore `object-fit` et
                          // étire l'image sur sa boîte. Ici c'est la boîte
                          // elle-même qui garde le rapport de forme du SVG.
                          // Le plafond de hauteur protège la page si le
                          // gabarit du SVG change un jour de proportions.
                          width: "auto",
                          height: "auto",
                          maxWidth: "100%",
                          maxHeight: `${LABEL_MAX_HEIGHT}px`,
                        }}
                        /* Requis par html2canvas (useCORS) pour photographier
                           un SVG servi par Supabase sans salir le canvas. */
                        crossOrigin="anonymous"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Pied : mentions légales, pleine largeur et centrées. */}
        <div
          style={{
            flexShrink: 0,
            margin: "10px 20px 0",
            borderTop: "1px solid #cfcfcf",
            // 28px de marge basse : l'affiche est glissée dans un cadre en
            // vitrine dont la bordure masquait le bas de la feuille, donc la
            // mention obligatoire.
            padding: "7px 0 28px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
            textAlign: "center",
            color: "#555555",
          }}
        >
          {energyCostNotice && (
            <div
              ref={noticeRef}
              style={{ fontSize: `${textSize}px`, color: INK_TEXT, lineHeight: 1.3 }}
            >
              {energyCostNotice}
            </div>
          )}
          <div style={{ fontSize: "9px", lineHeight: 1.3 }}>
            Les informations sur les risques auxquels ce bien est exposé sont
            disponibles sur le site Géorisques : www.georisques.gouv.fr
          </div>
        </div>
      </div>
    );
  },
);

LabelPreview.displayName = "LabelPreview";

const INK_TITLE = "#2b2b2b";
const INK_TEXT = "#333333";
/** Bornes de la taille de la description, en px. */
const DESCRIPTION_MAX_SIZE = 15;
const DESCRIPTION_MIN_SIZE = 9;
const DESCRIPTION_SIZE_STEP = 0.25;
/** Plafond de hauteur d'une étiquette, intitulé non compris. */
const LABEL_MAX_HEIGHT = 140;

/** Teinte claire de la couleur agence, pour les filets. */
function tint(color: string, alpha: number): string {
  const hex = color.trim().replace(/^#/, "");
  const full =
    hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  if (!/^[0-9a-f]{6}$/i.test(full)) return "#dddddd";
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
