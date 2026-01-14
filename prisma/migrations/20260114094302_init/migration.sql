-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('APPARTEMENT', 'MAISON', 'VILLA', 'TERRAIN', 'LOCAL_COMMERCIAL', 'BUREAUX', 'IMMEUBLE', 'PARKING', 'CAVE', 'LOFT', 'ATELIER', 'FERME', 'CHATEAU', 'PROPRIETE', 'AUTRE');

-- CreateEnum
CREATE TYPE "PropertySubType" AS ENUM ('STUDIO', 'T1', 'T2', 'T3', 'T4', 'T5_ET_PLUS', 'DUPLEX', 'TRIPLEX', 'PENTHOUSE', 'REZ_DE_JARDIN', 'DERNIER_ETAGE', 'CHAMBRE_DE_BONNE', 'LOFT', 'MAISON_DE_VILLE', 'MAISON_DE_CAMPAGNE', 'MAISON_MITOYENNE', 'MAISON_INDIVIDUELLE', 'PAVILLON', 'LONGERE', 'MAS', 'BASTIDE', 'CHALET', 'AUTRE');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('VENTE', 'LOCATION', 'VIAGER', 'LOCATION_SAISONNIERE');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('DISPONIBLE', 'SOUS_COMPROMIS', 'SOUS_OFFRE', 'VENDU', 'LOUE', 'ARCHIVE', 'BROUILLON');

-- CreateEnum
CREATE TYPE "EnergyClass" AS ENUM ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'VIERGE');

-- CreateEnum
CREATE TYPE "PropertyCondition" AS ENUM ('NEUF', 'TRES_BON_ETAT', 'BON_ETAT', 'A_RAFRAICHIR', 'A_RENOVER', 'A_RESTAURER');

-- CreateEnum
CREATE TYPE "Orientation" AS ENUM ('NORD', 'SUD', 'EST', 'OUEST', 'NORD_EST', 'NORD_OUEST', 'SUD_EST', 'SUD_OUEST');

-- CreateEnum
CREATE TYPE "ViewType" AS ENUM ('DEGAGEE', 'SUR_JARDIN', 'SUR_COUR', 'SUR_RUE', 'SUR_PARC', 'SUR_MER', 'SUR_MONTAGNE', 'PANORAMIQUE', 'SANS_VIS_A_VIS');

-- CreateEnum
CREATE TYPE "KitchenType" AS ENUM ('SEPAREE', 'OUVERTE', 'AMERICAINE', 'EQUIPEE', 'AMENAGEE', 'COIN_CUISINE');

-- CreateEnum
CREATE TYPE "HeatingType" AS ENUM ('INDIVIDUEL', 'COLLECTIF', 'MIXTE');

-- CreateEnum
CREATE TYPE "HeatingEnergy" AS ENUM ('GAZ', 'ELECTRIQUE', 'FIOUL', 'BOIS', 'POMPE_A_CHALEUR', 'GEOTHERMIE', 'SOLAIRE', 'CHAUFFAGE_URBAIN', 'MIXTE');

-- CreateEnum
CREATE TYPE "HotWaterType" AS ENUM ('INDIVIDUEL', 'COLLECTIF', 'CHAUFFE_EAU_ELECTRIQUE', 'CHAUFFE_EAU_GAZ', 'BALLON_THERMODYNAMIQUE', 'SOLAIRE');

-- CreateEnum
CREATE TYPE "SewageType" AS ENUM ('TOUT_A_LEGOUT', 'FOSSE_SEPTIQUE', 'MICRO_STATION');

-- CreateEnum
CREATE TYPE "ConstructionPeriod" AS ENUM ('AVANT_1850', 'DE_1850_A_1913', 'DE_1914_A_1947', 'DE_1948_A_1969', 'DE_1970_A_1980', 'DE_1981_A_1991', 'DE_1992_A_2000', 'DE_2001_A_2010', 'DE_2011_A_2020', 'APRES_2020');

-- CreateEnum
CREATE TYPE "Standing" AS ENUM ('STANDARD', 'BON_STANDING', 'STANDING', 'GRAND_STANDING', 'PRESTIGE', 'LUXE');

-- CreateEnum
CREATE TYPE "Exposure" AS ENUM ('TRES_LUMINEUX', 'LUMINEUX', 'NORMAL', 'SOMBRE');

-- CreateEnum
CREATE TYPE "ImageCategory" AS ENUM ('GENERAL', 'FACADE', 'SEJOUR', 'CUISINE', 'CHAMBRE', 'SALLE_DE_BAIN', 'WC', 'TERRASSE', 'BALCON', 'JARDIN', 'PISCINE', 'PARKING', 'CAVE', 'PLAN', 'VUE', 'AUTRE');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('DPE', 'DIAGNOSTIC_AMIANTE', 'DIAGNOSTIC_PLOMB', 'DIAGNOSTIC_ELECTRIQUE', 'DIAGNOSTIC_GAZ', 'DIAGNOSTIC_TERMITES', 'ERNMT', 'CARNET_ENTRETIEN', 'REGLEMENT_COPRO', 'PV_AG', 'PLAN', 'AUTRE');

-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('ENTREE', 'SEJOUR', 'SALON', 'SALLE_A_MANGER', 'CUISINE', 'CHAMBRE', 'SUITE_PARENTALE', 'BUREAU', 'SALLE_DE_BAIN', 'SALLE_D_EAU', 'WC', 'DRESSING', 'BUANDERIE', 'CELLIER', 'CAVE', 'GRENIER', 'GARAGE', 'TERRASSE', 'BALCON', 'JARDIN', 'VERANDA', 'AUTRE');

-- CreateEnum
CREATE TYPE "ProximityType" AS ENUM ('METRO', 'BUS', 'TRAM', 'RER', 'TRAIN', 'ECOLE_MATERNELLE', 'ECOLE_PRIMAIRE', 'COLLEGE', 'LYCEE', 'UNIVERSITE', 'CRECHE', 'SUPERMARCHE', 'COMMERCE', 'BOULANGERIE', 'PHARMACIE', 'MEDECIN', 'HOPITAL', 'PARC', 'SPORT', 'PISCINE', 'PLAGE', 'RESTAURANT', 'CINEMA', 'THEATRE', 'AUTRE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT,
    "reference" TEXT NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "propertySubType" "PropertySubType",
    "transactionType" "TransactionType" NOT NULL,
    "status" "PropertyStatus" NOT NULL DEFAULT 'DISPONIBLE',
    "condition" "PropertyCondition",
    "standing" "Standing",
    "availableFrom" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "soldAt" TIMESTAMP(3),
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isExclusive" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "contactCount" INTEGER NOT NULL DEFAULT 0,
    "favoriteCount" INTEGER NOT NULL DEFAULT 0,
    "internalNotes" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyFinance" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "pricePerMeter" DOUBLE PRECISION,
    "charges" DOUBLE PRECISION,
    "chargesIncluses" BOOLEAN NOT NULL DEFAULT false,
    "honoraires" DOUBLE PRECISION,
    "honorairesType" TEXT,
    "honorairesPct" DOUBLE PRECISION,
    "depot" DOUBLE PRECISION,
    "loyerReference" DOUBLE PRECISION,
    "complementLoyer" DOUBLE PRECISION,
    "bouquet" DOUBLE PRECISION,
    "rente" DOUBLE PRECISION,
    "taxeFonciere" DOUBLE PRECISION,
    "taxeHabitation" DOUBLE PRECISION,
    "isInvestment" BOOLEAN NOT NULL DEFAULT false,
    "currentRent" DOUBLE PRECISION,
    "occupancyStatus" TEXT,
    "rentalYield" DOUBLE PRECISION,

    CONSTRAINT "PropertyFinance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyLocation" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "addressComplement" TEXT,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "department" TEXT,
    "region" TEXT,
    "neighborhood" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "cadastralRef" TEXT,

    CONSTRAINT "PropertyLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyCharacteristics" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "surface" DOUBLE PRECISION NOT NULL,
    "surfaceCarrez" DOUBLE PRECISION,
    "surfaceTerrain" DOUBLE PRECISION,
    "surfaceSejour" DOUBLE PRECISION,
    "surfaceCuisine" DOUBLE PRECISION,
    "surfaceBalcon" DOUBLE PRECISION,
    "surfaceTerrasse" DOUBLE PRECISION,
    "surfaceJardin" DOUBLE PRECISION,
    "surfaceCave" DOUBLE PRECISION,
    "surfaceVeranda" DOUBLE PRECISION,
    "rooms" INTEGER NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "showerRooms" INTEGER,
    "toilets" INTEGER,
    "toiletsSeparate" BOOLEAN NOT NULL DEFAULT false,
    "kitchenType" "KitchenType",
    "kitchenEquipee" BOOLEAN NOT NULL DEFAULT false,
    "floor" INTEGER,
    "totalFloors" INTEGER,
    "levelsCount" INTEGER DEFAULT 1,
    "ceilingHeight" DOUBLE PRECISION,
    "orientation" "Orientation",
    "orientationSecondary" "Orientation",
    "exposure" "Exposure",
    "viewType" "ViewType",
    "viewDescription" TEXT,
    "yearBuilt" INTEGER,
    "constructionPeriod" "ConstructionPeriod",
    "renovatedYear" INTEGER,
    "buildingType" TEXT,
    "architectStyle" TEXT,
    "facadeMaterial" TEXT,
    "roofType" TEXT,
    "floorType" TEXT,
    "windowType" TEXT,
    "hasDoubleGlazing" BOOLEAN NOT NULL DEFAULT false,
    "shutterType" TEXT,
    "hasElectricShutters" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PropertyCharacteristics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyAmenities" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "hasBalcony" BOOLEAN NOT NULL DEFAULT false,
    "balconyCount" INTEGER,
    "hasTerrace" BOOLEAN NOT NULL DEFAULT false,
    "terraceCount" INTEGER,
    "hasRoofTerrace" BOOLEAN NOT NULL DEFAULT false,
    "hasLoggia" BOOLEAN NOT NULL DEFAULT false,
    "hasGarden" BOOLEAN NOT NULL DEFAULT false,
    "gardenPrivate" BOOLEAN NOT NULL DEFAULT false,
    "hasVeranda" BOOLEAN NOT NULL DEFAULT false,
    "hasPatio" BOOLEAN NOT NULL DEFAULT false,
    "hasCourtyard" BOOLEAN NOT NULL DEFAULT false,
    "hasParking" BOOLEAN NOT NULL DEFAULT false,
    "parkingType" TEXT,
    "parkingSpaces" INTEGER,
    "hasGarage" BOOLEAN NOT NULL DEFAULT false,
    "garageSpaces" INTEGER,
    "hasBox" BOOLEAN NOT NULL DEFAULT false,
    "boxCount" INTEGER,
    "hasCellar" BOOLEAN NOT NULL DEFAULT false,
    "cellarCount" INTEGER,
    "hasAttic" BOOLEAN NOT NULL DEFAULT false,
    "atticAmenageable" BOOLEAN NOT NULL DEFAULT false,
    "hasStorage" BOOLEAN NOT NULL DEFAULT false,
    "hasDressing" BOOLEAN NOT NULL DEFAULT false,
    "hasLaundryRoom" BOOLEAN NOT NULL DEFAULT false,
    "hasPool" BOOLEAN NOT NULL DEFAULT false,
    "poolType" TEXT,
    "poolSurface" DOUBLE PRECISION,
    "hasTennisCourt" BOOLEAN NOT NULL DEFAULT false,
    "hasElevator" BOOLEAN NOT NULL DEFAULT false,
    "elevatorCount" INTEGER,
    "hasIntercom" BOOLEAN NOT NULL DEFAULT false,
    "hasDigicode" BOOLEAN NOT NULL DEFAULT false,
    "hasVideophone" BOOLEAN NOT NULL DEFAULT false,
    "hasGuardian" BOOLEAN NOT NULL DEFAULT false,
    "hasAlarm" BOOLEAN NOT NULL DEFAULT false,
    "hasSecureDoor" BOOLEAN NOT NULL DEFAULT false,
    "hasGate" BOOLEAN NOT NULL DEFAULT false,
    "hasElectricGate" BOOLEAN NOT NULL DEFAULT false,
    "isGatedCommunity" BOOLEAN NOT NULL DEFAULT false,
    "accessPMR" BOOLEAN NOT NULL DEFAULT false,
    "isFurnished" BOOLEAN NOT NULL DEFAULT false,
    "furnishingDetails" TEXT,
    "hasWashingMachine" BOOLEAN NOT NULL DEFAULT false,
    "hasDishwasher" BOOLEAN NOT NULL DEFAULT false,
    "hasDryer" BOOLEAN NOT NULL DEFAULT false,
    "hasFridge" BOOLEAN NOT NULL DEFAULT false,
    "hasFreezer" BOOLEAN NOT NULL DEFAULT false,
    "hasOven" BOOLEAN NOT NULL DEFAULT false,
    "hasMicrowave" BOOLEAN NOT NULL DEFAULT false,
    "hasHotPlates" BOOLEAN NOT NULL DEFAULT false,
    "hasCoffeeMachine" BOOLEAN NOT NULL DEFAULT false,
    "hasTV" BOOLEAN NOT NULL DEFAULT false,
    "hasWifi" BOOLEAN NOT NULL DEFAULT false,
    "minLeaseDuration" INTEGER,
    "availableForStudents" BOOLEAN NOT NULL DEFAULT false,
    "availableForProfessionals" BOOLEAN NOT NULL DEFAULT false,
    "petsAllowed" BOOLEAN NOT NULL DEFAULT false,
    "smokingAllowed" BOOLEAN NOT NULL DEFAULT false,
    "nearPublicTransport" BOOLEAN NOT NULL DEFAULT false,
    "transportDetails" TEXT,
    "nearMetro" BOOLEAN NOT NULL DEFAULT false,
    "metroLine" TEXT,
    "metroDistance" INTEGER,
    "nearTrain" BOOLEAN NOT NULL DEFAULT false,
    "trainStation" TEXT,
    "trainDistance" INTEGER,
    "nearBus" BOOLEAN NOT NULL DEFAULT false,
    "nearTram" BOOLEAN NOT NULL DEFAULT false,
    "nearShops" BOOLEAN NOT NULL DEFAULT false,
    "nearSchools" BOOLEAN NOT NULL DEFAULT false,
    "schoolDetails" TEXT,
    "nearParks" BOOLEAN NOT NULL DEFAULT false,
    "nearSports" BOOLEAN NOT NULL DEFAULT false,
    "nearBeach" BOOLEAN NOT NULL DEFAULT false,
    "nearSkiSlopes" BOOLEAN NOT NULL DEFAULT false,
    "environmentType" TEXT,
    "noiseLevel" TEXT,
    "virtualTourUrl" TEXT,
    "videoUrl" TEXT,
    "tour3dUrl" TEXT,
    "floorPlanUrl" TEXT,

    CONSTRAINT "PropertyAmenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyEnergy" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "energyClass" "EnergyClass",
    "energyValue" INTEGER,
    "gesClass" "EnergyClass",
    "gesValue" INTEGER,
    "dpeDate" TIMESTAMP(3),
    "dpeEstimation" BOOLEAN NOT NULL DEFAULT false,
    "annualEnergyCost" DOUBLE PRECISION,
    "annualEnergyCostMin" DOUBLE PRECISION,
    "annualEnergyCostMax" DOUBLE PRECISION,
    "dpeImageUrl" TEXT,
    "gesImageUrl" TEXT,
    "labelGenerated" BOOLEAN NOT NULL DEFAULT false,
    "labelGeneratedAt" TIMESTAMP(3),
    "labelPdfUrl" TEXT,
    "labelColor" TEXT,
    "heatingType" "HeatingType",
    "heatingEnergy" "HeatingEnergy",
    "heatingDetails" TEXT,
    "hasRadiator" BOOLEAN NOT NULL DEFAULT false,
    "hasFloorHeating" BOOLEAN NOT NULL DEFAULT false,
    "hasFireplace" BOOLEAN NOT NULL DEFAULT false,
    "fireplaceType" TEXT,
    "hasAirConditioning" BOOLEAN NOT NULL DEFAULT false,
    "acType" TEXT,
    "hotWaterType" "HotWaterType",
    "sewageType" "SewageType",
    "hasFiberOptic" BOOLEAN NOT NULL DEFAULT false,
    "fiberStatus" TEXT,
    "hasAsbestos" BOOLEAN,
    "asbestosDiagDate" TIMESTAMP(3),
    "hasLead" BOOLEAN,
    "leadDiagDate" TIMESTAMP(3),
    "hasTermites" BOOLEAN,
    "termitesDiagDate" TIMESTAMP(3),
    "elecDiagDate" TIMESTAMP(3),
    "elecDiagResult" TEXT,
    "gasDiagDate" TIMESTAMP(3),
    "gasDiagResult" TEXT,
    "riskZone" TEXT,
    "floodZone" BOOLEAN NOT NULL DEFAULT false,
    "seismicZone" INTEGER,
    "noiseExposure" TEXT,

    CONSTRAINT "PropertyEnergy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyCopro" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "isInCopro" BOOLEAN NOT NULL DEFAULT false,
    "coprLots" INTEGER,
    "coprCharges" DOUBLE PRECISION,
    "coprChargesDetails" TEXT,
    "coprProcedure" BOOLEAN NOT NULL DEFAULT false,
    "coprProcedureDetails" TEXT,
    "coprSyndic" TEXT,
    "lotNumber" TEXT,
    "tantieme" DOUBLE PRECISION,
    "coprRecentWorks" TEXT,
    "coprFutureWorks" TEXT,

    CONSTRAINT "PropertyCopro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "category" "ImageCategory" NOT NULL DEFAULT 'GENERAL',
    "width" INTEGER,
    "height" INTEGER,
    "size" INTEGER,
    "propertyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyDocument" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "size" INTEGER,
    "propertyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyRoom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "RoomType" NOT NULL,
    "surface" DOUBLE PRECISION,
    "floor" INTEGER,
    "orientation" "Orientation",
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "PropertyRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyProximity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ProximityType" NOT NULL,
    "distance" INTEGER,
    "walkTime" INTEGER,
    "details" TEXT,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "PropertyProximity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Property_reference_key" ON "Property"("reference");

-- CreateIndex
CREATE INDEX "Property_propertyType_idx" ON "Property"("propertyType");

-- CreateIndex
CREATE INDEX "Property_transactionType_idx" ON "Property"("transactionType");

-- CreateIndex
CREATE INDEX "Property_status_idx" ON "Property"("status");

-- CreateIndex
CREATE INDEX "Property_isPublished_idx" ON "Property"("isPublished");

-- CreateIndex
CREATE INDEX "Property_isFeatured_idx" ON "Property"("isFeatured");

-- CreateIndex
CREATE INDEX "Property_createdAt_idx" ON "Property"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyFinance_propertyId_key" ON "PropertyFinance"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyLocation_propertyId_key" ON "PropertyLocation"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyLocation_city_idx" ON "PropertyLocation"("city");

-- CreateIndex
CREATE INDEX "PropertyLocation_postalCode_idx" ON "PropertyLocation"("postalCode");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyCharacteristics_propertyId_key" ON "PropertyCharacteristics"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyCharacteristics_surface_idx" ON "PropertyCharacteristics"("surface");

-- CreateIndex
CREATE INDEX "PropertyCharacteristics_rooms_idx" ON "PropertyCharacteristics"("rooms");

-- CreateIndex
CREATE INDEX "PropertyCharacteristics_bedrooms_idx" ON "PropertyCharacteristics"("bedrooms");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyAmenities_propertyId_key" ON "PropertyAmenities"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyEnergy_propertyId_key" ON "PropertyEnergy"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyEnergy_energyClass_idx" ON "PropertyEnergy"("energyClass");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyCopro_propertyId_key" ON "PropertyCopro"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyImage_propertyId_idx" ON "PropertyImage"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyImage_category_idx" ON "PropertyImage"("category");

-- CreateIndex
CREATE INDEX "PropertyDocument_propertyId_idx" ON "PropertyDocument"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyRoom_propertyId_idx" ON "PropertyRoom"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyProximity_propertyId_idx" ON "PropertyProximity"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyProximity_type_idx" ON "PropertyProximity"("type");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyFinance" ADD CONSTRAINT "PropertyFinance_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyLocation" ADD CONSTRAINT "PropertyLocation_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyCharacteristics" ADD CONSTRAINT "PropertyCharacteristics_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyAmenities" ADD CONSTRAINT "PropertyAmenities_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyEnergy" ADD CONSTRAINT "PropertyEnergy_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyCopro" ADD CONSTRAINT "PropertyCopro_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyImage" ADD CONSTRAINT "PropertyImage_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyDocument" ADD CONSTRAINT "PropertyDocument_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyRoom" ADD CONSTRAINT "PropertyRoom_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyProximity" ADD CONSTRAINT "PropertyProximity_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
