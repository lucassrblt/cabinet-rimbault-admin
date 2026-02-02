"use client";

import { forwardRef } from "react";

interface PropertyImage {
  id: string;
  url: string;
  alt?: string;
  order: number;
  isMain: boolean;
}

interface PropertyFinance {
  price: number;
  pricePerMeter?: number | null;
  charges?: number | null;
  honoraires?: number | null;
  honorairesType?: string | null;
  honorairesPct?: number | null;
  taxeFonciere?: number | null;
  taxeHabitation?: number | null;
}

interface PropertyLocation {
  city: string;
  postalCode: string;
  neighborhood?: string | null;
  address?: string;
}

interface PropertyCharacteristics {
  surface: number;
  surfaceCarrez?: number | null;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  showerRooms?: number | null;
  toilets?: number | null;
  toiletsSeparate?: boolean;
  floor?: number | null;
  floorIsRezDeChaussee?: boolean;
  totalFloors?: number | null;
  levelsCount?: number | null;
  ceilingHeight?: number | null;
  surfaceTerrain?: number | null;
  surfaceSejour?: number | null;
  surfaceCuisine?: number | null;
  surfaceBalcon?: number | null;
  surfaceTerrasse?: number | null;
  surfaceJardin?: number | null;
  surfaceCave?: number | null;
  surfaceVeranda?: number | null;
  yearBuilt?: number | null;
  constructionPeriod?: string | null;
  renovatedYear?: number | null;
  orientation?: string | null;
  exposure?: string | null;
  viewType?: string | null;
  kitchenType?: string | null;
  kitchenEquipee?: boolean;
}

interface PropertyAmenities {
  hasBalcony?: boolean;
  balconyCount?: number | null;
  hasTerrace?: boolean;
  terraceCount?: number | null;
  hasGarden?: boolean;
  gardenPrivate?: boolean;
  hasVeranda?: boolean;
  hasParking?: boolean;
  parkingType?: string | null;
  parkingSpaces?: number | null;
  hasGarage?: boolean;
  garageSpaces?: number | null;
  hasBox?: boolean;
  boxCount?: number | null;
  hasCellar?: boolean;
  cellarCount?: number | null;
  hasAttic?: boolean;
  atticAmenageable?: boolean;
  hasElevator?: boolean;
  hasIntercom?: boolean;
  hasDigicode?: boolean;
  hasPool?: boolean;
  poolType?: string | null;
}

interface PropertyEnergy {
  heatingType?: string | null;
  heatingEnergy?: string | null;
  energyClass?: string | null;
  energyValue?: number | null;
  gesClass?: string | null;
  gesValue?: number | null;
  hasRadiator?: boolean;
  hasFloorHeating?: boolean;
  hasFireplace?: boolean;
  fireplaceType?: string | null;
  hasAirConditioning?: boolean;
  acType?: string | null;
}

interface PropertyCopro {
  isInCopro?: boolean;
  coprLots?: number | null;
  coprCharges?: number | null;
  coprSyndic?: string | null;
  lotNumber?: string | null;
  tantieme?: number | null;
}

interface Property {
  id: string;
  reference: string;
  title: string;
  description: string;
  propertyType: string;
  transactionType: string;
  status: string;
  standing?: string | null;
  condition?: string | null;
  finance: PropertyFinance | null;
  location: PropertyLocation | null;
  characteristics: PropertyCharacteristics | null;
  amenities: PropertyAmenities | null;
  energy: PropertyEnergy | null;
  copro: PropertyCopro | null;
  images: PropertyImage[];
}

interface AgencyContacts {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
}

interface DescriptiveSheetPreviewProps {
  property: Property;
  selectedPhotos: PropertyImage[];
  agencyContacts: AgencyContacts;
  description: string;
  dpeImageUrl: string | null;
  gesImageUrl: string | null;
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
};

// Composant d'étiquette DPE simplifiée (uniquement DPE, sans GES)
function DPEScale({
  energyClass,
  energyValue,
}: {
  energyClass: string;
  energyValue: number;
}) {
  const classes = ["A", "B", "C", "D", "E", "F", "G"];

  return (
    <div style={{ width: "230px", fontSize: "10px" }}>
      <div
        style={{
          textAlign: "center",
          marginBottom: "6px",
          fontSize: "9px",
          color: "#333",
          fontWeight: "500",
        }}
      >
        Logement extrêmement performant
      </div>
      <div style={{ position: "relative" }}>
        {classes.map((cls, idx) => {
          const isActive = cls === energyClass;
          const barWidth = 65 + idx * 18; // Largeur croissante, compacte

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
                  color:
                    cls === "A" || cls === "B" || cls === "G"
                      ? "white"
                      : "#333",
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
          );
        })}
      </div>
      <div
        style={{
          textAlign: "center",
          marginTop: "6px",
          fontSize: "9px",
          color: "#333",
          fontWeight: "500",
        }}
      >
        Logement extrêmement peu performant
      </div>
    </div>
  );
}

export const DescriptiveSheetPreview = forwardRef<
  HTMLDivElement,
  DescriptiveSheetPreviewProps
>(
  (
    { property, selectedPhotos, agencyContacts, description, dpeImageUrl },
    ref,
  ) => {
    const formatPrice = (price: number) => {
      return price.toLocaleString("fr-FR");
    };

    // Générer le résumé du bien (ex: "3P + 1 Balcon + 1 Parking + 1 Cave")
    const getPropertySummary = () => {
      const parts: string[] = [];

      if (property.characteristics?.rooms) {
        parts.push(`${property.characteristics.rooms}P`);
      }
      if (property.characteristics?.bedrooms) {
        parts.push(`${property.characteristics.bedrooms} Chambres`);
      }
      if (property.amenities?.hasBalcony) {
        const count = property.amenities.balconyCount || 1;
        parts.push(`${count} Balcon${count > 1 ? "s" : ""}`);
      }
      if (property.amenities?.hasParking) {
        const count = property.amenities.parkingSpaces || 1;
        parts.push(`${count} Parking${count > 1 ? "s" : ""}`);
      }
      if (property.amenities?.hasCellar) {
        const count = property.amenities.cellarCount || 1;
        parts.push(`${count} Cave${count > 1 ? "s" : ""}`);
      }
      if (property.amenities?.hasTerrace) {
        parts.push("Terrasse");
      }
      if (property.amenities?.hasGarden) {
        parts.push("Jardin");
      }

      return parts.join(" + ");
    };

    // Obtenir le standing formaté
    const getStandingLabel = (standing?: string | null) => {
      const labels: Record<string, string> = {
        STANDARD: "Standard",
        BON_STANDING: "Bon",
        STANDING: "Standing",
        GRAND_STANDING: "Grand standing",
        PRESTIGE: "Prestige",
        LUXE: "Luxe",
      };
      return standing ? labels[standing] || standing : "Non renseigné";
    };

    // Obtenir le type de chauffage formaté
    const getHeatingLabel = () => {
      const type = property.energy?.heatingType;
      const energy = property.energy?.heatingEnergy;

      const typeLabels: Record<string, string> = {
        INDIVIDUEL: "Individuel",
        COLLECTIF: "Collectif",
        MIXTE: "Mixte",
      };

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
      };

      const typePart = type ? typeLabels[type] || type : "";
      const energyPart = energy ? energyLabels[energy] || energy : "";

      if (typePart && energyPart) {
        return `${energyPart} ${typePart}`;
      }
      return typePart || energyPart || "Non renseigné";
    };

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
      };
      return orientation ? labels[orientation] || orientation : null;
    };

    // Obtenir l'état du bien formaté
    const getConditionLabel = (condition?: string | null) => {
      const labels: Record<string, string> = {
        NEUF: "Neuf",
        TRES_BON_ETAT: "Très bon état",
        BON_ETAT: "Bon état",
        A_RAFRAICHIR: "À rafraîchir",
        A_RENOVER: "À rénover",
        A_RESTAURER: "À restaurer",
      };
      return condition ? labels[condition] || condition : null;
    };

    // Obtenir le type de cuisine formaté
    const getKitchenLabel = (
      kitchenType?: string | null,
      kitchenEquipee?: boolean,
    ) => {
      const labels: Record<string, string> = {
        SEPAREE: "Séparée",
        OUVERTE: "Ouverte",
        AMERICAINE: "Américaine",
        EQUIPEE: "Équipée",
        AMENAGEE: "Aménagée",
        COIN_CUISINE: "Coin cuisine",
      };
      const typeLabel = kitchenType ? labels[kitchenType] || kitchenType : null;
      if (typeLabel && kitchenEquipee) {
        return `${typeLabel} équipée`;
      }
      return typeLabel;
    };

    // Obtenir le type de vue formaté
    const getViewLabel = (viewType?: string | null) => {
      const labels: Record<string, string> = {
        DEGAGEE: "Dégagée",
        SUR_JARDIN: "Sur jardin",
        SUR_COUR: "Sur cour",
        SUR_RUE: "Sur rue",
        SUR_PARC: "Sur parc",
        SUR_MER: "Sur mer",
        SUR_MONTAGNE: "Sur montagne",
        PANORAMIQUE: "Panoramique",
        SANS_VIS_A_VIS: "Sans vis-à-vis",
      };
      return viewType ? labels[viewType] || viewType : null;
    };

    // Obtenir l'exposition formatée
    const getExposureLabel = (exposure?: string | null) => {
      const labels: Record<string, string> = {
        TRES_LUMINEUX: "Très lumineux",
        LUMINEUX: "Lumineux",
        NORMAL: "Normal",
        SOMBRE: "Sombre",
      };
      return exposure ? labels[exposure] || exposure : null;
    };

    // Générer les informations pertinentes du bien pour le tableau
    interface PropertyInfoItem {
      label: string;
      value: string;
    }

    const getRelevantPropertyInfo = (): PropertyInfoItem[] => {
      const items: PropertyInfoItem[] = [];

      // === SURFACES ===
      if (property.characteristics?.surface) {
        const surfaceLabel =
          property.transactionType === "VENTE"
            ? "Surface Loi Carrez"
            : "Surface Habitable";
        items.push({
          label: surfaceLabel,
          value: `${property.characteristics.surface} m²`,
        });
      }
      if (
        property.characteristics?.surfaceCarrez &&
        property.characteristics.surfaceCarrez !==
          property.characteristics?.surface
      ) {
        items.push({
          label: "Surface Carrez",
          value: `${property.characteristics.surfaceCarrez} m²`,
        });
      }
      if (property.characteristics?.surfaceSejour) {
        items.push({
          label: "Surface séjour",
          value: `${property.characteristics.surfaceSejour} m²`,
        });
      }
      if (property.characteristics?.surfaceTerrain) {
        items.push({
          label: "Surface terrain",
          value: `${property.characteristics.surfaceTerrain} m²`,
        });
      }

      // === COMPOSITION ===
      if (property.characteristics?.rooms) {
        const chambres = property.characteristics.bedrooms
          ? ` dont ${property.characteristics.bedrooms} ch.`
          : "";
        items.push({
          label: "Pièces",
          value: `${property.characteristics.rooms}${chambres}`,
        });
      }

      // Salles de bains (avec baignoire)
      const sdb = property.characteristics?.bathrooms || 0;
      if (sdb > 0) {
        items.push({
          label: "Salle de bain",
          value: String(sdb),
        });
      }

      // Salles d'eau (avec douche)
      const sde = property.characteristics?.showerRooms || 0;
      if (sde > 0) {
        items.push({
          label: "Salle d'eau",
          value: String(sde),
        });
      }

      // Cuisine
      const kitchenLabel = getKitchenLabel(
        property.characteristics?.kitchenType,
        property.characteristics?.kitchenEquipee,
      );
      if (kitchenLabel) {
        items.push({
          label: "Cuisine",
          value: kitchenLabel,
        });
      }

      // Étage — toujours affiché ; "Rez-de-chaussée" si coché ou étage 0, sinon N/total
      const floorIsRez = property.characteristics?.floorIsRezDeChaussee === true;
      const floorNum = property.characteristics?.floor;
      const totalFloors = property.characteristics?.totalFloors;
      let etageValue: string;
      if (floorIsRez || (floorNum !== null && floorNum !== undefined && floorNum === 0)) {
        etageValue = "Rez-de-chaussée";
      } else if (floorNum !== null && floorNum !== undefined) {
        etageValue = `${floorNum}${totalFloors != null ? `/${totalFloors}` : ""}`;
      } else {
        etageValue = "—";
      }
      items.push({
        label: "Étage",
        value: etageValue,
      });

      // === ÉQUIPEMENTS ===
      // Chauffage
      const heatingLabel = getHeatingLabel();
      if (heatingLabel !== "Non renseigné") {
        items.push({
          label: "Chauffage",
          value: heatingLabel,
        });
      }

      // Climatisation
      if (property.energy?.hasAirConditioning) {
        items.push({
          label: "Climatisation",
          value: "Oui",
        });
      }

      // Ascenseur
      if (property.amenities?.hasElevator) {
        items.push({
          label: "Ascenseur",
          value: "Oui",
        });
      }

      // Parking / Garage
      const parkingParts: string[] = [];
      if (property.amenities?.hasParking) {
        const count = property.amenities.parkingSpaces || 1;
        parkingParts.push(`${count} parking${count > 1 ? "s" : ""}`);
      }
      if (property.amenities?.hasGarage) {
        const count = property.amenities.garageSpaces || 1;
        parkingParts.push(`${count} garage${count > 1 ? "s" : ""}`);
      }
      if (property.amenities?.hasBox) {
        const count = property.amenities.boxCount || 1;
        parkingParts.push(`${count} box`);
      }
      if (parkingParts.length > 0) {
        items.push({
          label: "Stationnement",
          value: parkingParts.join(" + "),
        });
      }

      // Cave
      if (property.amenities?.hasCellar) {
        const count = property.amenities.cellarCount || 1;
        const surfaceCave = property.characteristics?.surfaceCave
          ? ` (${property.characteristics.surfaceCave} m²)`
          : "";
        items.push({
          label: "Cave",
          value: `${count}${surfaceCave}`,
        });
      }

      // Balcon / Terrasse
      const extParts: string[] = [];
      if (property.amenities?.hasBalcony) {
        const count = property.amenities.balconyCount || 1;
        const surface = property.characteristics?.surfaceBalcon
          ? ` (${property.characteristics.surfaceBalcon} m²)`
          : "";
        extParts.push(`${count} balcon${count > 1 ? "s" : ""}${surface}`);
      }
      if (property.amenities?.hasTerrace) {
        const count = property.amenities.terraceCount || 1;
        const surface = property.characteristics?.surfaceTerrasse
          ? ` (${property.characteristics.surfaceTerrasse} m²)`
          : "";
        extParts.push(`${count} terrasse${count > 1 ? "s" : ""}${surface}`);
      }
      if (extParts.length > 0) {
        items.push({
          label: "Extérieurs",
          value: extParts.join(" + "),
        });
      }

      // Jardin
      if (property.amenities?.hasGarden) {
        const surface = property.characteristics?.surfaceJardin
          ? `${property.characteristics.surfaceJardin} m²`
          : "Oui";
        const privatif = property.amenities.gardenPrivate ? " (privatif)" : "";
        items.push({
          label: "Jardin",
          value: `${surface}${privatif}`,
        });
      }

      // Piscine
      if (property.amenities?.hasPool) {
        items.push({
          label: "Piscine",
          value: property.amenities.poolType || "Oui",
        });
      }

      // === EXPOSITION ===
      const orientationLabel = getOrientationLabel(
        property.characteristics?.orientation,
      );
      if (orientationLabel) {
        items.push({
          label: "Exposition",
          value: orientationLabel,
        });
      }

      const viewLabel = getViewLabel(property.characteristics?.viewType);
      if (viewLabel) {
        items.push({
          label: "Vue",
          value: viewLabel,
        });
      }

      const exposureLabel = getExposureLabel(
        property.characteristics?.exposure,
      );
      if (exposureLabel) {
        items.push({
          label: "Luminosité",
          value: exposureLabel,
        });
      }

      // === GÉNÉRAL ===
      // Standing (seulement si différent de STANDARD)
      if (property.standing && property.standing !== "STANDARD") {
        items.push({
          label: "Standing",
          value: getStandingLabel(property.standing),
        });
      }

      // État du bien
      const conditionLabel = getConditionLabel(property.condition);
      if (conditionLabel) {
        items.push({
          label: "État",
          value: conditionLabel,
        });
      }

      // Année de construction
      if (property.characteristics?.yearBuilt) {
        items.push({
          label: "Année construction",
          value: String(property.characteristics.yearBuilt),
        });
      }

      // === FINANCES ===
      // La taxe foncière n'est pertinente que pour les ventes (payée par le propriétaire)
      if (
        property.transactionType === "VENTE" &&
        property.finance?.taxeFonciere
      ) {
        items.push({
          label: "Taxe foncière",
          value: `${property.finance.taxeFonciere.toLocaleString("fr-FR")} €/an`,
        });
      }

      // === COPROPRIÉTÉ ===
      if (property.copro?.isInCopro && property.copro.coprCharges) {
        items.push({
          label: "Charges copro",
          value: `${property.copro.coprCharges.toLocaleString("fr-FR")} €/an`,
        });
      }

      return items;
    };

    const propertyInfoItems = getRelevantPropertyInfo();

    // Calculer le prix hors honoraires (prix FAI - honoraires)
    const calculatePriceExcludingFees = () => {
      if (
        property.finance?.honorairesType === "acquereur" &&
        property.finance?.honorairesPct
      ) {
        return property.finance.price - (property.finance.honoraires ?? 0);
      }
      return null;
    };

    const priceExcluding = calculatePriceExcludingFees();

    const energyClass = property.energy?.energyClass || "D";
    const energyValue = property.energy?.energyValue || 0;

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
            backgroundColor: "#780000",
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
          <div
            style={{ textAlign: "right", fontSize: "12px", lineHeight: "1.6" }}
          >
            <div
              style={{
                fontWeight: "bold",
                fontSize: "16px",
                marginBottom: "4px",
                letterSpacing: "0.5px",
              }}
            >
              {agencyContacts.name.toUpperCase()}
            </div>
            {agencyContacts.address && (
              <div>
                {agencyContacts.address} {agencyContacts.postalCode}{" "}
                {agencyContacts.city}
              </div>
            )}
            {agencyContacts.phone && <div>Tel : {agencyContacts.phone}</div>}
            {agencyContacts.email && <div>Email : {agencyContacts.email}</div>}
            <div>Xavier Rimbault</div>
          </div>
        </div>

        {/* Section principale avec titre, référence et prix */}
        <div
          style={{ padding: "20px 24px", borderBottom: "3px solid #780000" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            {/* Gauche: Ville et résumé + référence */}
            <div style={{ flex: 1 }}>
              <h1
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  color: "#780000",
                  margin: "0 0 8px 0",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {property.location?.city || "N/A"}
              </h1>
              <div
                style={{
                  fontSize: "14px",
                  color: "#333",
                  marginBottom: "6px",
                  fontWeight: "500",
                }}
              >
                {getPropertySummary()}
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                <strong>Réf :</strong> {property.reference}
              </div>
            </div>

            {/* Droite: Prix avec logique honoraires */}
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#780000",
                }}
              >
                {property.finance?.price
                  ? formatPrice(property.finance.price)
                  : "N/A"}{" "}
                €
              </div>
              {property.finance?.honorairesType === "acquereur" &&
              priceExcluding ? (
                <>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#333",
                      marginTop: "4px",
                    }}
                  >
                    soit {priceExcluding.toLocaleString("fr-FR")} € honoraires
                    exclus
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#333",
                      marginTop: "2px",
                    }}
                  >
                    Honoraires de{" "}
                    {property.finance.honorairesPct
                      ?.toString()
                      .replace(".", ",")}
                    % TTC à la charge de l&apos;acquéreur
                  </div>
                </>
              ) : (
                <div
                  style={{ fontSize: "11px", color: "#333", marginTop: "4px" }}
                >
                  Honoraires à la charge du vendeur
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section photos - 3 photos en ligne avec celle du milieu plus grande */}
        <div style={{ padding: "12px 24px" }}>
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
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
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#999",
                    fontSize: "11px",
                  }}
                >
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
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#999",
                    fontSize: "11px",
                  }}
                >
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
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#999",
                    fontSize: "11px",
                  }}
                >
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
              <div
                style={{
                  display: "flex",
                  alignItems: "stretch",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    width: "5px",
                    backgroundColor: "#780000",
                    marginRight: "12px",
                    borderRadius: "2px",
                  }}
                />
                <h2
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#333",
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  COMMENTAIRE
                </h2>
              </div>
              <p
                style={{
                  fontSize: "10px",
                  color: "#444",
                  lineHeight: "1.6",
                  textAlign: "justify",
                  margin: 0,
                }}
              >
                {description}
              </p>
            </div>

            {/* DPE diagram uniquement (pas de GES) - centré verticalement, plus compact */}
            <div
              style={{
                width: "250px",
                flexShrink: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {dpeImageUrl ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dpeImageUrl}
                    alt="DPE"
                    style={{ height: "180px", width: "auto" }}
                    crossOrigin="anonymous"
                  />
                </div>
              ) : (
                <DPEScale energyClass={energyClass} energyValue={energyValue} />
              )}
            </div>
          </div>
        </div>

        {/* Section DESCRIPTION DU BIEN - Tableau dynamique */}
        <div style={{ padding: "0 24px 12px 24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "5px",
                backgroundColor: "#780000",
                marginRight: "12px",
                borderRadius: "2px",
              }}
            />
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                color: "#333",
                margin: 0,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              CARACTÉRISTIQUES
            </h2>
          </div>

          {/* Tableau de caractéristiques dynamique - affiche uniquement les infos pertinentes */}
          {propertyInfoItems.length > 0 ? (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "10px",
                tableLayout: "fixed",
              }}
            >
              <tbody>
                {/* Afficher les éléments par paires (2 colonnes) */}
                {Array.from({
                  length: Math.ceil(propertyInfoItems.length / 2),
                }).map((_, rowIndex) => {
                  const leftItem = propertyInfoItems[rowIndex * 2];
                  const rightItem = propertyInfoItems[rowIndex * 2 + 1];
                  return (
                    <tr key={rowIndex}>
                      {/* Colonne gauche */}
                      <td
                        style={{
                          padding: "5px 6px",
                          borderBottom: "1px solid #e0e0e0",
                          fontWeight: "bold",
                          width: "22%",
                          backgroundColor: "#f8f9fa",
                          color: "#333",
                        }}
                      >
                        {leftItem.label} :
                      </td>
                      <td
                        style={{
                          padding: "5px 6px",
                          borderBottom: "1px solid #e0e0e0",
                          width: "28%",
                          color: "#444",
                        }}
                      >
                        {leftItem.value}
                      </td>
                      {/* Colonne droite */}
                      {rightItem ? (
                        <>
                          <td
                            style={{
                              padding: "5px 6px",
                              borderBottom: "1px solid #e0e0e0",
                              fontWeight: "bold",
                              width: "22%",
                              backgroundColor: "#f8f9fa",
                              color: "#333",
                            }}
                          >
                            {rightItem.label} :
                          </td>
                          <td
                            style={{
                              padding: "5px 6px",
                              borderBottom: "1px solid #e0e0e0",
                              width: "28%",
                              color: "#444",
                            }}
                          >
                            {rightItem.value}
                          </td>
                        </>
                      ) : (
                        <>
                          <td
                            style={{
                              padding: "5px 6px",
                              borderBottom: "1px solid #e0e0e0",
                              backgroundColor: "#f8f9fa",
                            }}
                          />
                          <td
                            style={{
                              padding: "5px 6px",
                              borderBottom: "1px solid #e0e0e0",
                            }}
                          />
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p style={{ fontSize: "10px", color: "#666", fontStyle: "italic" }}>
              Aucune caractéristique renseignée
            </p>
          )}

          {/* Note sur les charges de copropriété */}
          {property.copro?.isInCopro && property.copro?.coprCharges && (
            <div
              style={{
                marginTop: "6px",
                padding: "6px 10px",
                backgroundColor: "#f5f5f5",
                borderRadius: "4px",
                fontSize: "9px",
                color: "#666",
              }}
            >
              Montant moyen annuel de la quote-part propriétaire du budget
              prévisionnel :{" "}
              {property.copro.coprCharges.toLocaleString("fr-FR")} € (soit{" "}
              {Math.round(property.copro.coprCharges / 12).toLocaleString(
                "fr-FR",
              )}{" "}
              €/mois)
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
            backgroundColor: "#780000",
            color: "white",
            padding: "14px 24px",
            textAlign: "center",
            fontSize: "13px",
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
            {agencyContacts.name}
          </div>
        </div>
      </div>
    );
  },
);

DescriptiveSheetPreview.displayName = "DescriptiveSheetPreview";
