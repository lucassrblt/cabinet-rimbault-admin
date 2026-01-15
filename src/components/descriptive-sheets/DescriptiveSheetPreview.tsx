"use client"

import { forwardRef } from "react"

interface PropertyImage {
  id: string
  url: string
  alt?: string
  order: number
  isMain: boolean
}

interface PropertyFinance {
  price: number
  honoraires?: number | null
  honorairesType?: string | null
  honorairesPct?: number | null
  taxeFonciere?: number | null
}

interface PropertyLocation {
  city: string
  postalCode: string
  neighborhood?: string | null
  address?: string
}

interface PropertyCharacteristics {
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
  yearBuilt?: number | null
  orientation?: string | null
}

interface PropertyAmenities {
  hasBalcony?: boolean
  balconyCount?: number | null
  hasTerrace?: boolean
  hasGarden?: boolean
  hasParking?: boolean
  parkingSpaces?: number | null
  hasGarage?: boolean
  hasCellar?: boolean
  cellarCount?: number | null
  hasElevator?: boolean
  hasPool?: boolean
}

interface PropertyEnergy {
  heatingType?: string | null
  heatingEnergy?: string | null
  energyClass?: string | null
  energyValue?: number | null
  gesClass?: string | null
  gesValue?: number | null
}

interface PropertyCopro {
  isInCopro?: boolean
  coprLots?: number | null
  coprCharges?: number | null
}

interface Property {
  id: string
  reference: string
  title: string
  description: string
  propertyType: string
  transactionType: string
  status: string
  standing?: string | null
  finance: PropertyFinance | null
  location: PropertyLocation | null
  characteristics: PropertyCharacteristics | null
  amenities: PropertyAmenities | null
  energy: PropertyEnergy | null
  copro: PropertyCopro | null
  images: PropertyImage[]
}

interface AgencyContacts {
  name: string
  address: string
  city: string
  postalCode: string
  phone: string
  email: string
}

interface DescriptiveSheetPreviewProps {
  property: Property
  selectedPhotos: PropertyImage[]
  agencyContacts: AgencyContacts
  description: string
  dpeImageUrl: string | null
  gesImageUrl: string | null
}

// Couleurs DPE selon la classe énergétique
const DPE_COLORS: Record<string, string> = {
  A: "#319834",
  B: "#33cc31",
  C: "#cbfc34",
  D: "#fbfe06",
  E: "#fccc07",
  F: "#fc9935",
  G: "#fc0205",
}

// Composant d'étiquette DPE simplifiée
function DPEScale({ 
  energyClass, 
  energyValue,
  gesValue 
}: { 
  energyClass: string
  energyValue: number
  gesValue: number
}) {
  const classes = ["A", "B", "C", "D", "E", "F", "G"]
  
  return (
    <div style={{ width: "200px", fontSize: "9px" }}>
      <div style={{ textAlign: "center", marginBottom: "4px", fontSize: "8px", color: "#333" }}>
        Logement extrêmement performant
      </div>
      <div style={{ position: "relative" }}>
        {classes.map((cls, idx) => {
          const isActive = cls === energyClass
          const barWidth = 60 + idx * 15 // Largeur croissante
          
          return (
            <div 
              key={cls}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "2px",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: `${barWidth}px`,
                  height: "14px",
                  backgroundColor: DPE_COLORS[cls],
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: "4px",
                  fontWeight: "bold",
                  color: cls === "A" || cls === "B" || cls === "G" ? "white" : "#333",
                  fontSize: "10px",
                  borderRadius: isActive ? "0" : "0 4px 4px 0",
                }}
              >
                {cls}
              </div>
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    left: `${barWidth}px`,
                    backgroundColor: "#333",
                    color: "white",
                    padding: "2px 6px",
                    borderRadius: "0 4px 4px 0",
                    fontSize: "9px",
                    fontWeight: "bold",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    lineHeight: "1.1",
                  }}
                >
                  <span style={{ fontSize: "8px", opacity: 0.8 }}>Conso</span>
                  <span>{energyValue}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div style={{ textAlign: "center", marginTop: "4px", fontSize: "8px", color: "#333" }}>
        Logement extrêmement peu performant
      </div>
      
      {/* GES indicator */}
      <div style={{ 
        marginTop: "8px", 
        padding: "4px 8px", 
        backgroundColor: "#f5f5f5", 
        borderRadius: "4px",
        fontSize: "8px",
        textAlign: "center"
      }}>
        <span>Émission : </span>
        <strong>{gesValue}</strong>
        <span> kg CO₂/m²/an</span>
      </div>
    </div>
  )
}

export const DescriptiveSheetPreview = forwardRef<HTMLDivElement, DescriptiveSheetPreviewProps>(
  ({ property, selectedPhotos, agencyContacts, description, dpeImageUrl, gesImageUrl }, ref) => {
    const formatPrice = (price: number) => {
      return price.toLocaleString("fr-FR")
    }

    // Générer le résumé du bien (ex: "3P + 1 Balcon + 1 Parking + 1 Cave")
    const getPropertySummary = () => {
      const parts: string[] = []
      
      if (property.characteristics?.rooms) {
        parts.push(`${property.characteristics.rooms}P`)
      }
      if (property.characteristics?.bedrooms) {
        parts.push(`${property.characteristics.bedrooms} Chambres`)
      }
      if (property.amenities?.hasBalcony) {
        const count = property.amenities.balconyCount || 1
        parts.push(`${count} Balcon${count > 1 ? "s" : ""}`)
      }
      if (property.amenities?.hasParking) {
        const count = property.amenities.parkingSpaces || 1
        parts.push(`${count} Parking${count > 1 ? "s" : ""}`)
      }
      if (property.amenities?.hasCellar) {
        const count = property.amenities.cellarCount || 1
        parts.push(`${count} Cave${count > 1 ? "s" : ""}`)
      }
      if (property.amenities?.hasTerrace) {
        parts.push("Terrasse")
      }
      if (property.amenities?.hasGarden) {
        parts.push("Jardin")
      }
      
      return parts.join(" + ")
    }

    // Obtenir le standing formaté
    const getStandingLabel = (standing?: string | null) => {
      const labels: Record<string, string> = {
        STANDARD: "Standard",
        BON_STANDING: "Bon",
        STANDING: "Standing",
        GRAND_STANDING: "Grand standing",
        PRESTIGE: "Prestige",
        LUXE: "Luxe",
      }
      return standing ? labels[standing] || standing : "Non renseigné"
    }

    // Obtenir le type de chauffage formaté
    const getHeatingLabel = () => {
      const type = property.energy?.heatingType
      const energy = property.energy?.heatingEnergy
      
      const typeLabels: Record<string, string> = {
        INDIVIDUEL: "Individuel",
        COLLECTIF: "Collectif",
        MIXTE: "Mixte",
      }
      
      const energyLabels: Record<string, string> = {
        GAZ: "Gaz",
        ELECTRIQUE: "Électrique",
        FIOUL: "Fioul",
        BOIS: "Bois",
        POMPE_A_CHALEUR: "Pompe à chaleur",
        GEOTHERMIE: "Géothermie",
        SOLAIRE: "Solaire",
        CHAUFFAGE_URBAIN: "Chauffage urbain",
        MIXTE: "Mixte",
      }
      
      const typePart = type ? typeLabels[type] || type : ""
      const energyPart = energy ? energyLabels[energy] || energy : ""
      
      if (typePart && energyPart) {
        return `${energyPart} ${typePart}`
      }
      return typePart || energyPart || "Non renseigné"
    }

    // Obtenir l'orientation formatée
    const getOrientationLabel = (orientation?: string | null) => {
      const labels: Record<string, string> = {
        NORD: "Nord",
        SUD: "Sud",
        EST: "Est",
        OUEST: "Ouest",
        NORD_EST: "N/E",
        NORD_OUEST: "N/O",
        SUD_EST: "S/E",
        SUD_OUEST: "S/O",
      }
      return orientation ? labels[orientation] || orientation : "Non renseigné"
    }

    // Obtenir les honoraires label
    const getHonorairesLabel = () => {
      if (property.finance?.honorairesType === "vendeur") {
        return "Honoraires à la charge du vendeur"
      } else if (property.finance?.honorairesType === "acquereur") {
        if (property.finance?.honorairesPct) {
          return `dont ${property.finance.honorairesPct}% honoraires acquéreur`
        }
        return "Honoraires charge acquéreur"
      }
      return ""
    }

    const energyClass = property.energy?.energyClass || "D"
    const energyValue = property.energy?.energyValue || 0
    const gesValue = property.energy?.gesValue || 0

    return (
      <div
        ref={ref}
        className="bg-white"
        style={{
          width: "794px", // A4 width at 96 DPI
          minHeight: "1123px", // A4 height at 96 DPI
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: "11px",
          lineHeight: "1.4",
          position: "relative",
        }}
      >
        {/* Header bleu avec infos agence */}
        <div
          style={{
            backgroundColor: "#1a5490",
            color: "white",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontWeight: "bold", fontSize: "18px", letterSpacing: "1px" }}>
            {agencyContacts.name.toUpperCase()}
          </div>
          <div style={{ textAlign: "right", fontSize: "11px", lineHeight: "1.5" }}>
            {agencyContacts.address && (
              <div>{agencyContacts.address} {agencyContacts.postalCode} {agencyContacts.city}</div>
            )}
            {agencyContacts.phone && <div>Tel : {agencyContacts.phone}</div>}
            {agencyContacts.email && <div>Email : {agencyContacts.email}</div>}
          </div>
        </div>

        {/* Section principale avec ville, prix, agent */}
        <div style={{ padding: "20px 24px", borderBottom: "3px solid #1a5490" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            {/* Gauche: Ville et résumé */}
            <div style={{ flex: 1 }}>
              <h1 style={{ 
                fontSize: "26px", 
                fontWeight: "bold", 
                color: "#1a5490", 
                margin: "0 0 8px 0",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}>
                {property.location?.city || "N/A"}
              </h1>
              <div style={{ 
                fontSize: "13px", 
                color: "#333", 
                marginBottom: "4px",
                fontWeight: "500",
              }}>
                {getPropertySummary()}
              </div>
              <div style={{ fontSize: "11px", color: "#666" }}>
                <strong>Réf :</strong> {property.reference}
              </div>
            </div>

            {/* Droite: Agent et prix */}
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "14px", fontWeight: "bold", color: "#333" }}>
                {agencyContacts.name}
              </div>
              <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
                {agencyContacts.phone}
              </div>
              <div style={{ 
                fontSize: "28px", 
                fontWeight: "bold", 
                color: "#1a5490",
              }}>
                {property.finance?.price ? formatPrice(property.finance.price) : "N/A"} €
              </div>
              <div style={{ fontSize: "10px", color: "#666", marginTop: "2px" }}>
                {getHonorairesLabel()}
              </div>
            </div>
          </div>
        </div>

        {/* Photo principale */}
        <div style={{ padding: "16px 24px" }}>
          {selectedPhotos[0] && (
            <div
              style={{
                width: "100%",
                height: "300px",
                overflow: "hidden",
                borderRadius: "4px",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPhotos[0].url}
                alt="Photo principale"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                crossOrigin="anonymous"
              />
            </div>
          )}
        </div>

        {/* Section COMMENTAIRE avec DPE */}
        <div style={{ padding: "0 24px 16px 24px" }}>
          <div style={{ display: "flex", gap: "20px" }}>
            {/* Description */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "stretch", marginBottom: "8px" }}>
                <div style={{ 
                  width: "4px", 
                  backgroundColor: "#1a5490", 
                  marginRight: "10px",
                  borderRadius: "2px",
                }} />
                <h2 style={{ 
                  fontSize: "14px", 
                  fontWeight: "bold", 
                  color: "#333",
                  margin: 0,
                }}>
                  COMMENTAIRE
                </h2>
              </div>
              <p style={{ 
                fontSize: "10px", 
                color: "#444", 
                lineHeight: "1.6",
                textAlign: "justify",
                margin: 0,
              }}>
                {description}
              </p>
            </div>

            {/* DPE diagram */}
            <div style={{ width: "220px", flexShrink: 0 }}>
              {dpeImageUrl ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dpeImageUrl}
                    alt="DPE"
                    style={{ height: "140px", width: "auto" }}
                    crossOrigin="anonymous"
                  />
                  {gesImageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={gesImageUrl}
                      alt="GES"
                      style={{ height: "80px", width: "auto" }}
                      crossOrigin="anonymous"
                    />
                  )}
                </div>
              ) : (
                <DPEScale 
                  energyClass={energyClass} 
                  energyValue={energyValue}
                  gesValue={gesValue}
                />
              )}
            </div>
          </div>
        </div>

        {/* Section DESCRIPTION DU BIEN */}
        <div style={{ padding: "0 24px 16px 24px" }}>
          <div style={{ display: "flex", alignItems: "stretch", marginBottom: "12px" }}>
            <div style={{ 
              width: "4px", 
              backgroundColor: "#1a5490", 
              marginRight: "10px",
              borderRadius: "2px",
            }} />
            <h2 style={{ 
              fontSize: "14px", 
              fontWeight: "bold", 
              color: "#333",
              margin: 0,
            }}>
              DESCRIPTION DU BIEN
            </h2>
          </div>

          {/* Tableau de caractéristiques */}
          <table style={{ 
            width: "100%", 
            borderCollapse: "collapse",
            fontSize: "10px",
          }}>
            <tbody>
              <tr>
                <td style={{ 
                  padding: "6px 8px", 
                  borderBottom: "1px solid #e0e0e0",
                  fontWeight: "bold",
                  width: "25%",
                }}>
                  Ascenseur :
                </td>
                <td style={{ 
                  padding: "6px 8px", 
                  borderBottom: "1px solid #e0e0e0",
                  width: "25%",
                }}>
                  {property.amenities?.hasElevator ? "Oui" : "Non"}
                </td>
                <td style={{ 
                  padding: "6px 8px", 
                  borderBottom: "1px solid #e0e0e0",
                  fontWeight: "bold",
                  width: "25%",
                }}>
                  Ancienneté :
                </td>
                <td style={{ 
                  padding: "6px 8px", 
                  borderBottom: "1px solid #e0e0e0",
                  width: "25%",
                }}>
                  {property.characteristics?.yearBuilt || "Non renseigné"}
                </td>
              </tr>
              <tr>
                <td style={{ 
                  padding: "6px 8px", 
                  borderBottom: "1px solid #e0e0e0",
                  fontWeight: "bold",
                }}>
                  Standing :
                </td>
                <td style={{ 
                  padding: "6px 8px", 
                  borderBottom: "1px solid #e0e0e0",
                }}>
                  {getStandingLabel(property.standing)}
                </td>
                <td style={{ 
                  padding: "6px 8px", 
                  borderBottom: "1px solid #e0e0e0",
                  fontWeight: "bold",
                }}>
                  Surface Carrez :
                </td>
                <td style={{ 
                  padding: "6px 8px", 
                  borderBottom: "1px solid #e0e0e0",
                }}>
                  {property.characteristics?.surfaceCarrez 
                    ? `${property.characteristics.surfaceCarrez} m²` 
                    : "Non renseigné"}
                </td>
              </tr>
              <tr>
                <td style={{ 
                  padding: "6px 8px", 
                  borderBottom: "1px solid #e0e0e0",
                  fontWeight: "bold",
                }}>
                  Nombre de pièces :
                </td>
                <td style={{ 
                  padding: "6px 8px", 
                  borderBottom: "1px solid #e0e0e0",
                }}>
                  {property.characteristics?.rooms 
                    ? `${property.characteristics.rooms} dont ${property.characteristics.bedrooms} Chambres`
                    : "Non renseigné"}
                </td>
                <td style={{ 
                  padding: "6px 8px", 
                  borderBottom: "1px solid #e0e0e0",
                  fontWeight: "bold",
                }}>
                  Exposition :
                </td>
                <td style={{ 
                  padding: "6px 8px", 
                  borderBottom: "1px solid #e0e0e0",
                }}>
                  {getOrientationLabel(property.characteristics?.orientation)}
                </td>
              </tr>
              <tr>
                <td style={{ 
                  padding: "6px 8px", 
                  borderBottom: "1px solid #e0e0e0",
                  fontWeight: "bold",
                }}>
                  Balcon :
                </td>
                <td style={{ 
                  padding: "6px 8px", 
                  borderBottom: "1px solid #e0e0e0",
                }}>
                  {property.characteristics?.surfaceBalcon 
                    ? `${property.characteristics.surfaceBalcon}m²`
                    : property.amenities?.hasBalcony 
                      ? "Oui" 
                      : "Non"}
                </td>
                <td style={{ 
                  padding: "6px 8px", 
                  borderBottom: "1px solid #e0e0e0",
                  fontWeight: "bold",
                }}>
                  Cave :
                </td>
                <td style={{ 
                  padding: "6px 8px", 
                  borderBottom: "1px solid #e0e0e0",
                }}>
                  {property.amenities?.hasCellar ? "Oui" : "Non"}
                </td>
              </tr>
              <tr>
                <td style={{ 
                  padding: "6px 8px", 
                  borderBottom: "1px solid #e0e0e0",
                  fontWeight: "bold",
                }}>
                  Chauffage :
                </td>
                <td style={{ 
                  padding: "6px 8px", 
                  borderBottom: "1px solid #e0e0e0",
                }}>
                  {getHeatingLabel()}
                </td>
                <td style={{ 
                  padding: "6px 8px", 
                  borderBottom: "1px solid #e0e0e0",
                  fontWeight: "bold",
                }}>
                  Taxe Foncière :
                </td>
                <td style={{ 
                  padding: "6px 8px", 
                  borderBottom: "1px solid #e0e0e0",
                }}>
                  {property.finance?.taxeFonciere 
                    ? `${property.finance.taxeFonciere.toLocaleString("fr-FR")} €`
                    : "Non renseigné"}
                </td>
              </tr>
              <tr>
                <td style={{ 
                  padding: "6px 8px", 
                  borderBottom: "1px solid #e0e0e0",
                  fontWeight: "bold",
                }}>
                  Parking :
                </td>
                <td style={{ 
                  padding: "6px 8px", 
                  borderBottom: "1px solid #e0e0e0",
                }}>
                  {property.amenities?.hasParking 
                    ? (property.amenities.parkingSpaces || 1)
                    : "Non"}
                </td>
                <td style={{ 
                  padding: "6px 8px", 
                  borderBottom: "1px solid #e0e0e0",
                  fontWeight: "bold",
                }}>
                  Charges copropriété :
                </td>
                <td style={{ 
                  padding: "6px 8px", 
                  borderBottom: "1px solid #e0e0e0",
                }}>
                  {property.copro?.coprCharges 
                    ? `${property.copro.coprCharges.toLocaleString("fr-FR")} €/an soit ${Math.round(property.copro.coprCharges / 12).toLocaleString("fr-FR")} €/mois`
                    : "Non renseigné"}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Note sur les charges */}
          {property.copro?.coprCharges && (
            <div style={{ 
              marginTop: "12px", 
              padding: "8px 12px", 
              backgroundColor: "#f5f5f5", 
              borderRadius: "4px",
              fontSize: "9px",
              color: "#666",
            }}>
              - Montant moyen annuel de la quote part propriétaire du budget prévisionnel : {property.copro.coprCharges.toLocaleString("fr-FR")} €
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#1a5490",
            color: "white",
            padding: "12px 24px",
            textAlign: "center",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          <div>{agencyContacts.name}</div>
          {agencyContacts.address && (
            <div style={{ fontSize: "10px", fontWeight: "normal", marginTop: "2px" }}>
              {agencyContacts.name}
            </div>
          )}
        </div>
      </div>
    )
  }
)

DescriptiveSheetPreview.displayName = "DescriptiveSheetPreview"
