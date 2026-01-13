"use client"

import { forwardRef } from "react"

export interface LabelProperty {
  reference: string
  title: string
  description: string
  propertyType: string
  transactionType: string
  price: number
  city: string
  postalCode: string
  surface: number
  surfaceCarrez?: number | null
  rooms: number
  bedrooms: number
  bathrooms: number
  floor?: number | null
  totalFloors?: number | null
  surfaceTerrain?: number | null
  surfaceSejour?: number | null
  surfaceBalcon?: number | null
  surfaceCave?: number | null
  status: string
  energyClass?: string | null
  energyValue?: number | null
  gesClass?: string | null
  gesValue?: number | null
  hasBalcony?: boolean
  hasTerrace?: boolean
  hasGarden?: boolean
  hasParking?: boolean
  hasGarage?: boolean
  hasCellar?: boolean
  hasElevator?: boolean
  hasPool?: boolean
  honoraires?: number | null
  honorairesType?: string | null
  honorairesPct?: number | null
  heatingType?: string | null
  heatingEnergy?: string | null
  isInCopro?: boolean
  coprLots?: number | null
  coprCharges?: number | null
  neighborhood?: string | null
  dpeImageUrl?: string | null
  gesImageUrl?: string | null
}

interface SelectedPhoto {
  id: string
  url: string
  alt?: string | null
}

interface LabelPreviewProps {
  property: LabelProperty
  primaryColor?: string
  propertyImageUrl?: string | null  // Deprecated, use selectedPhotos
  selectedPhotos?: SelectedPhoto[]
}

const typeLabels: Record<string, string> = {
  APPARTEMENT: "APPARTEMENT",
  MAISON: "MAISON",
  VILLA: "VILLA",
  TERRAIN: "TERRAIN",
  LOCAL_COMMERCIAL: "LOCAL COMMERCIAL",
  BUREAUX: "BUREAUX",
  IMMEUBLE: "IMMEUBLE",
  PARKING: "PARKING",
  CAVE: "CAVE",
  AUTRE: "AUTRE",
}

export const LabelPreview = forwardRef<HTMLDivElement, LabelPreviewProps>(
  ({ property, primaryColor = "#780000", propertyImageUrl, selectedPhotos = [] }, ref) => {
    // Use selectedPhotos if provided, fallback to single propertyImageUrl for backwards compatibility
    const mainPhotoUrl = selectedPhotos.length > 0 ? selectedPhotos[0]?.url : propertyImageUrl
    const smallPhotos = selectedPhotos.slice(1, 4)

    const formatPrice = (price: number) => {
      return price.toLocaleString("fr-FR")
    }

    const calculatePriceExcludingFees = () => {
      if (property.honorairesType === "acquereur" && property.honorairesPct) {
        return Math.round(property.price / (1 + property.honorairesPct / 100))
      }
      return null
    }

    const calculateHonorairesAmount = () => {
      if (property.honorairesType === "acquereur" && property.honorairesPct) {
        return Math.round((property.price * property.honorairesPct) / (100 + property.honorairesPct))
      }
      return property.honoraires
    }

    const priceExcluding = calculatePriceExcludingFees()
    const honorairesAmount = calculateHonorairesAmount()

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
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              padding: "5px 12px",
              borderRadius: "4px",
            }}
          >
            <span style={{ color: "#ffffff", fontSize: "11px", fontWeight: 600 }}>
              Réf {property.reference}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Left Column - Photos */}
          <div style={{ width: "50%", display: "flex", flexDirection: "column", padding: "15px" }}>
            {/* Property Title */}
            <div
              style={{
                fontSize: "14px",
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
                <span style={{ fontSize: "32px", opacity: 0.5 }}>📷 Photo du bien</span>
              )}
              {/* Type Badge */}
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "10px",
                  backgroundColor: primaryColor,
                  padding: "6px 14px",
                  borderRadius: "4px",
                }}
              >
                <span
                  style={{
                    color: "#ffffff",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "1px",
                  }}
                >
                  {typeLabels[property.propertyType] || property.propertyType}
                </span>
              </div>
            </div>

            {/* Small Photos Row */}
            <div style={{ display: "flex", gap: "8px" }}>
              {[0, 1, 2].map((index) => {
                const photo = smallPhotos[index]
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
                )
              })}
            </div>
          </div>

          {/* Right Column - Info */}
          <div
            style={{
              width: "50%",
              padding: "15px 20px",
              backgroundColor: "#f8f9fa",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Price Section */}
            <div style={{ marginBottom: "15px" }}>
              <div style={{ fontSize: "10px", color: "#6c757d", marginBottom: "4px" }}>
                {property.transactionType === "LOCATION" ? "Loyer mensuel" : "Prix de vente"}
                {property.honorairesType === "acquereur" && " (FAI)"}
              </div>
              <div style={{ fontSize: "32px", fontWeight: 700, color: primaryColor }}>
                {formatPrice(property.price)}
                <span style={{ fontSize: "16px" }}> €</span>
              </div>
              {honorairesAmount && (
                <div style={{ fontSize: "9px", color: "#6c757d", marginTop: "4px" }}>
                  Honoraires : {honorairesAmount.toLocaleString("fr-FR")} €{" "}
                  {property.honorairesType === "acquereur"
                    ? `(${property.honorairesPct}% charge acquéreur)`
                    : "(charge vendeur)"}
                </div>
              )}
              {priceExcluding && (
                <div style={{ fontSize: "10px", color: "#495057", marginTop: "4px", fontWeight: 600 }}>
                  Prix hors honoraires : {priceExcluding.toLocaleString("fr-FR")} €
                </div>
              )}
              <div
                style={{
                  backgroundColor: property.honorairesType === "acquereur" ? "#fff3cd" : "#d4edda",
                  border: `1px solid ${property.honorairesType === "acquereur" ? "#ffc107" : "#28a745"}`,
                  padding: "5px 10px",
                  borderRadius: "4px",
                  marginTop: "8px",
                  display: "inline-block",
                }}
              >
                <span
                  style={{
                    fontSize: "9px",
                    color: property.honorairesType === "acquereur" ? "#856404" : "#155724",
                    fontWeight: 600,
                  }}
                >
                  {property.honorairesType === "acquereur"
                    ? "⚠ Honoraires à la charge de l'acquéreur"
                    : "✓ Honoraires à la charge du vendeur"}
                </span>
              </div>
            </div>

            {/* Location */}
            <div
              style={{
                marginBottom: "15px",
                padding: "8px 12px",
                backgroundColor: "#ffffff",
                borderRadius: "6px",
                borderLeft: `4px solid ${primaryColor}`,
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#212529" }}>
                {property.postalCode} {property.city}
              </div>
              {property.neighborhood && (
                <div style={{ fontSize: "9px", color: "#6c757d", marginTop: "2px" }}>
                  {property.neighborhood}
                </div>
              )}
            </div>

            {/* Description Section */}
            <div
              style={{
                flex: 1,
                marginBottom: "15px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: primaryColor,
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Description
              </div>
              <div
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#ffffff",
                  borderRadius: "6px",
                  border: "1px solid #e9ecef",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    lineHeight: 1.6,
                    color: "#333333",
                    textAlign: "justify",
                    margin: 0,
                  }}
                >
                  {property.description}
                </p>
              </div>
            </div>

            {/* DPE/GES Images Section */}
            {(property.dpeImageUrl || property.gesImageUrl) && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-end",
                  gap: "20px",
                  paddingTop: "10px",
                  borderTop: "1px solid #e9ecef",
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
                        height: "100px",
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
                        height: "100px",
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
    )
  }
)

LabelPreview.displayName = "LabelPreview"
