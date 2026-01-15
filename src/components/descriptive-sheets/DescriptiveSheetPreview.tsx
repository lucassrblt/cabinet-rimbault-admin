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

// Composant d'étiquette DPE simplifiée (uniquement DPE, sans GES)
function DPEScale({ 
  energyClass, 
  energyValue,
}: { 
  energyClass: string
  energyValue: number
}) {
  const classes = ["A", "B", "C", "D", "E", "F", "G"]
  
  return (
    <div style={{ width: "230px", fontSize: "10px" }}>
      <div style={{ textAlign: "center", marginBottom: "6px", fontSize: "9px", color: "#333", fontWeight: "500" }}>
        Logement extrêmement performant
      </div>
      <div style={{ position: "relative" }}>
        {classes.map((cls, idx) => {
          const isActive = cls === energyClass
          const barWidth = 65 + idx * 18 // Largeur croissante, compacte
          
          return (
            <div 
              key={cls}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "3px",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: `${barWidth}px`,
                  height: "18px",
                  backgroundColor: DPE_COLORS[cls],
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: "6px",
                  fontWeight: "bold",
                  color: cls === "A" || cls === "B" || cls === "G" ? "white" : "#333",
                  fontSize: "12px",
                  borderRadius: isActive ? "0" : "0 5px 5px 0",
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
                    padding: "3px 8px",
                    borderRadius: "0 5px 5px 0",
                    fontSize: "10px",
                    fontWeight: "bold",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    lineHeight: "1.2",
                    minWidth: "50px",
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
      <div style={{ textAlign: "center", marginTop: "6px", fontSize: "9px", color: "#333", fontWeight: "500" }}>
        Logement extrêmement peu performant
      </div>
    </div>
  )
}

export const DescriptiveSheetPreview = forwardRef<HTMLDivElement, DescriptiveSheetPreviewProps>(
  ({ property, selectedPhotos, agencyContacts, description, dpeImageUrl }, ref) => {
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

    // Calculer le prix hors honoraires
    const calculatePriceExcludingFees = () => {
      if (property.finance?.honorairesType === "acquereur" && property.finance?.honorairesPct && property.finance?.price) {
        return Math.round(property.finance.price / (1 + property.finance.honorairesPct / 100))
      }
      return null
    }

    const priceExcluding = calculatePriceExcludingFees()

    const energyClass = property.energy?.energyClass || "D"
    const energyValue = property.energy?.energyValue || 0

    // Date du jour formatée
    const todayDate = new Date().toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })

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
          paddingBottom: "70px", // Espace réservé pour le footer absolu
          boxSizing: "border-box",
        }}
      >
        {/* Header bleu avec infos agence - pleine largeur */}
        <div
          style={{
            backgroundColor: "#1a5490",
            color: "white",
            padding: "20px 24px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-start",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* Infos agence en colonne à droite */}
          <div style={{ textAlign: "right", fontSize: "12px", lineHeight: "1.6" }}>
            <div style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "4px", letterSpacing: "0.5px" }}>
              {agencyContacts.name.toUpperCase()}
            </div>
            {agencyContacts.address && (
              <div>{agencyContacts.address} {agencyContacts.postalCode} {agencyContacts.city}</div>
            )}
            {agencyContacts.phone && <div>Tel : {agencyContacts.phone}</div>}
            {agencyContacts.email && <div>Email : {agencyContacts.email}</div>}
          </div>
        </div>

        {/* Section principale avec titre, référence et prix */}
        <div style={{ padding: "20px 24px", borderBottom: "3px solid #1a5490" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            {/* Gauche: Ville et résumé + référence */}
            <div style={{ flex: 1 }}>
              <h1 style={{ 
                fontSize: "28px", 
                fontWeight: "bold", 
                color: "#1a5490", 
                margin: "0 0 8px 0",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}>
                {property.location?.city || "N/A"}
              </h1>
              <div style={{ 
                fontSize: "14px", 
                color: "#333", 
                marginBottom: "6px",
                fontWeight: "500",
              }}>
                {getPropertySummary()}
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                <strong>Réf :</strong> {property.reference}
              </div>
            </div>

            {/* Droite: Prix avec logique honoraires */}
            <div style={{ textAlign: "right" }}>
              <div style={{ 
                fontSize: "32px", 
                fontWeight: "bold", 
                color: "#1a5490",
              }}>
                {property.finance?.price ? formatPrice(property.finance.price) : "N/A"} €
              </div>
              {property.finance?.honorairesType === "acquereur" && priceExcluding ? (
                <>
                  <div style={{ fontSize: "11px", color: "#333", marginTop: "4px" }}>
                    soit {priceExcluding.toLocaleString("fr-FR")} € honoraires exclus
                  </div>
                  <div style={{ fontSize: "11px", color: "#333", marginTop: "2px" }}>
                    Honoraires de {property.finance.honorairesPct}% TTC à la charge de l&apos;acquéreur
                  </div>
                </>
              ) : (
                <div style={{ fontSize: "11px", color: "#333", marginTop: "4px" }}>
                  Honoraires à la charge du vendeur
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section photos - 3 photos en ligne avec celle du milieu plus grande */}
        <div style={{ padding: "12px 24px" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center" }}>
            {/* Photo gauche (plus petite) */}
            <div
              style={{
                width: "200px",
                height: "150px",
                overflow: "hidden",
                borderRadius: "5px",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                border: "1px solid #e0e0e0",
              }}
            >
              {selectedPhotos[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedPhotos[0].url}
                  alt="Photo 1"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  crossOrigin="anonymous"
                />
              ) : (
                <div style={{ 
                  width: "100%", 
                  height: "100%", 
                  backgroundColor: "#f0f0f0", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  color: "#999",
                  fontSize: "11px",
                }}>
                  📷 Photo 1
                </div>
              )}
            </div>

            {/* Photo centrale (plus grande) */}
            <div
              style={{
                width: "260px",
                height: "180px",
                overflow: "hidden",
                borderRadius: "5px",
                flexShrink: 0,
                boxShadow: "0 3px 12px rgba(0, 0, 0, 0.18)",
                border: "1px solid #e0e0e0",
              }}
            >
              {selectedPhotos[1] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedPhotos[1].url}
                  alt="Photo principale"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  crossOrigin="anonymous"
                />
              ) : (
                <div style={{ 
                  width: "100%", 
                  height: "100%", 
                  backgroundColor: "#f0f0f0", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  color: "#999",
                  fontSize: "11px",
                }}>
                  📷 Photo 2
                </div>
              )}
            </div>

            {/* Photo droite (plus petite) */}
            <div
              style={{
                width: "200px",
                height: "150px",
                overflow: "hidden",
                borderRadius: "5px",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                border: "1px solid #e0e0e0",
              }}
            >
              {selectedPhotos[2] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedPhotos[2].url}
                  alt="Photo 3"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  crossOrigin="anonymous"
                />
              ) : (
                <div style={{ 
                  width: "100%", 
                  height: "100%", 
                  backgroundColor: "#f0f0f0", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  color: "#999",
                  fontSize: "11px",
                }}>
                  📷 Photo 3
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section COMMENTAIRE avec DPE */}
        <div style={{ padding: "0 24px 12px 24px" }}>
          <div style={{ display: "flex", gap: "20px", alignItems: "stretch" }}>
            {/* Description - plus large */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "stretch", marginBottom: "8px" }}>
                <div style={{ 
                  width: "5px", 
                  backgroundColor: "#1a5490", 
                  marginRight: "12px",
                  borderRadius: "2px",
                }} />
                <h2 style={{ 
                  fontSize: "16px", 
                  fontWeight: "bold", 
                  color: "#333",
                  margin: 0,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
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

            {/* DPE diagram uniquement (pas de GES) - centré verticalement, plus compact */}
            <div style={{ 
              width: "250px", 
              flexShrink: 0, 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center",
            }}>
              {dpeImageUrl ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dpeImageUrl}
                    alt="DPE"
                    style={{ height: "180px", width: "auto" }}
                    crossOrigin="anonymous"
                  />
                </div>
              ) : (
                <DPEScale 
                  energyClass={energyClass} 
                  energyValue={energyValue}
                />
              )}
            </div>
          </div>
        </div>

        {/* Section DESCRIPTION DU BIEN */}
        <div style={{ padding: "0 24px 12px 24px" }}>
          <div style={{ display: "flex", alignItems: "stretch", marginBottom: "8px" }}>
            <div style={{ 
              width: "5px", 
              backgroundColor: "#1a5490", 
              marginRight: "12px",
              borderRadius: "2px",
            }} />
            <h2 style={{ 
              fontSize: "16px", 
              fontWeight: "bold", 
              color: "#333",
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              DESCRIPTION DU BIEN
            </h2>
          </div>

          {/* Tableau de caractéristiques - style compact pour éviter débordement */}
          <table style={{ 
            width: "100%", 
            borderCollapse: "collapse",
            fontSize: "10px",
            tableLayout: "fixed",
          }}>
            <tbody>
              <tr>
                <td style={{ 
                  padding: "5px 6px", 
                  borderBottom: "1px solid #e0e0e0",
                  fontWeight: "bold",
                  width: "20%",
                  backgroundColor: "#f8f9fa",
                  color: "#333",
                }}>
                  Ascenseur :
                </td>
                <td style={{ 
                  padding: "5px 6px", 
                  borderBottom: "1px solid #e0e0e0",
                  width: "30%",
                  color: "#444",
                }}>
                  {property.amenities?.hasElevator ? "Oui" : "Non"}
                </td>
                <td style={{ 
                  padding: "5px 6px", 
                  borderBottom: "1px solid #e0e0e0",
                  fontWeight: "bold",
                  width: "20%",
                  backgroundColor: "#f8f9fa",
                  color: "#333",
                }}>
                  Ancienneté :
                </td>
                <td style={{ 
                  padding: "5px 6px", 
                  borderBottom: "1px solid #e0e0e0",
                  width: "30%",
                  color: "#444",
                }}>
                  {property.characteristics?.yearBuilt || "Non renseigné"}
                </td>
              </tr>
              <tr>
                <td style={{ 
                  padding: "5px 6px", 
                  borderBottom: "1px solid #e0e0e0",
                  fontWeight: "bold",
                  backgroundColor: "#f8f9fa",
                  color: "#333",
                }}>
                  Standing :
                </td>
                <td style={{ 
                  padding: "5px 6px", 
                  borderBottom: "1px solid #e0e0e0",
                  color: "#444",
                }}>
                  {getStandingLabel(property.standing)}
                </td>
                <td style={{ 
                  padding: "5px 6px", 
                  borderBottom: "1px solid #e0e0e0",
                  fontWeight: "bold",
                  backgroundColor: "#f8f9fa",
                  color: "#333",
                }}>
                  Surface Carrez :
                </td>
                <td style={{ 
                  padding: "5px 6px", 
                  borderBottom: "1px solid #e0e0e0",
                  color: "#444",
                }}>
                  {property.characteristics?.surfaceCarrez 
                    ? `${property.characteristics.surfaceCarrez} m²` 
                    : "Non renseigné"}
                </td>
              </tr>
              <tr>
                <td style={{ 
                  padding: "5px 6px", 
                  borderBottom: "1px solid #e0e0e0",
                  fontWeight: "bold",
                  backgroundColor: "#f8f9fa",
                  color: "#333",
                }}>
                  Nb. pièces :
                </td>
                <td style={{ 
                  padding: "5px 6px", 
                  borderBottom: "1px solid #e0e0e0",
                  color: "#444",
                }}>
                  {property.characteristics?.rooms 
                    ? `${property.characteristics.rooms} dont ${property.characteristics.bedrooms} Ch.`
                    : "Non renseigné"}
                </td>
                <td style={{ 
                  padding: "5px 6px", 
                  borderBottom: "1px solid #e0e0e0",
                  fontWeight: "bold",
                  backgroundColor: "#f8f9fa",
                  color: "#333",
                }}>
                  Exposition :
                </td>
                <td style={{ 
                  padding: "5px 6px", 
                  borderBottom: "1px solid #e0e0e0",
                  color: "#444",
                }}>
                  {getOrientationLabel(property.characteristics?.orientation)}
                </td>
              </tr>
              <tr>
                <td style={{ 
                  padding: "5px 6px", 
                  borderBottom: "1px solid #e0e0e0",
                  fontWeight: "bold",
                  backgroundColor: "#f8f9fa",
                  color: "#333",
                }}>
                  Balcon :
                </td>
                <td style={{ 
                  padding: "5px 6px", 
                  borderBottom: "1px solid #e0e0e0",
                  color: "#444",
                }}>
                  {property.characteristics?.surfaceBalcon 
                    ? `${property.characteristics.surfaceBalcon}m²`
                    : property.amenities?.hasBalcony 
                      ? "Oui" 
                      : "Non"}
                </td>
                <td style={{ 
                  padding: "5px 6px", 
                  borderBottom: "1px solid #e0e0e0",
                  fontWeight: "bold",
                  backgroundColor: "#f8f9fa",
                  color: "#333",
                }}>
                  Cave :
                </td>
                <td style={{ 
                  padding: "5px 6px", 
                  borderBottom: "1px solid #e0e0e0",
                  color: "#444",
                }}>
                  {property.amenities?.hasCellar ? "Oui" : "Non"}
                </td>
              </tr>
              <tr>
                <td style={{ 
                  padding: "5px 6px", 
                  borderBottom: "1px solid #e0e0e0",
                  fontWeight: "bold",
                  backgroundColor: "#f8f9fa",
                  color: "#333",
                }}>
                  Chauffage :
                </td>
                <td style={{ 
                  padding: "5px 6px", 
                  borderBottom: "1px solid #e0e0e0",
                  color: "#444",
                }}>
                  {getHeatingLabel()}
                </td>
                <td style={{ 
                  padding: "5px 6px", 
                  borderBottom: "1px solid #e0e0e0",
                  fontWeight: "bold",
                  backgroundColor: "#f8f9fa",
                  color: "#333",
                }}>
                  Taxe Foncière :
                </td>
                <td style={{ 
                  padding: "5px 6px", 
                  borderBottom: "1px solid #e0e0e0",
                  color: "#444",
                }}>
                  {property.finance?.taxeFonciere 
                    ? `${property.finance.taxeFonciere.toLocaleString("fr-FR")} €`
                    : "Non renseigné"}
                </td>
              </tr>
              <tr>
                <td style={{ 
                  padding: "5px 6px", 
                  borderBottom: "1px solid #e0e0e0",
                  fontWeight: "bold",
                  backgroundColor: "#f8f9fa",
                  color: "#333",
                }}>
                  Parking :
                </td>
                <td style={{ 
                  padding: "5px 6px", 
                  borderBottom: "1px solid #e0e0e0",
                  color: "#444",
                }}>
                  {property.amenities?.hasParking 
                    ? (property.amenities.parkingSpaces || 1)
                    : "Non"}
                </td>
                <td style={{ 
                  padding: "5px 6px", 
                  borderBottom: "1px solid #e0e0e0",
                  fontWeight: "bold",
                  backgroundColor: "#f8f9fa",
                  color: "#333",
                }}>
                  Charges copro. :
                </td>
                <td style={{ 
                  padding: "5px 6px", 
                  borderBottom: "1px solid #e0e0e0",
                  color: "#444",
                }}>
                  {property.copro?.coprCharges 
                    ? `${property.copro.coprCharges.toLocaleString("fr-FR")} €/an`
                    : "Non renseigné"}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Note sur les charges */}
          {property.copro?.coprCharges && (
            <div style={{ 
              marginTop: "6px", 
              padding: "6px 10px", 
              backgroundColor: "#f5f5f5", 
              borderRadius: "4px",
              fontSize: "9px",
              color: "#666",
            }}>
              - Montant moyen annuel de la quote part propriétaire du budget prévisionnel : {property.copro.coprCharges.toLocaleString("fr-FR")} € (soit {Math.round(property.copro.coprCharges / 12).toLocaleString("fr-FR")} €/mois)
            </div>
          )}
        </div>

        {/* Footer - pleine largeur */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            width: "100%",
            backgroundColor: "#1a5490",
            color: "white",
            padding: "14px 24px",
            textAlign: "center",
            fontSize: "13px",
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{agencyContacts.name}</div>
          <div style={{ fontSize: "11px", fontWeight: "normal", opacity: 0.9 }}>
            Document professionnel daté du {todayDate}
          </div>
        </div>
      </div>
    )
  }
)

DescriptiveSheetPreview.displayName = "DescriptiveSheetPreview"
