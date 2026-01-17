-- =====================================================================================================================
-- SCRIPT DE SEED - PROPRIÉTÉS POUR COURBEVOIE, ASNIÈRES-SUR-SEINE ET LEVALLOIS-PERRET
-- =====================================================================================================================
-- Ce fichier contient 15 propriétés variées dans les villes de Courbevoie, Asnières-sur-Seine et Levallois-Perret
-- Les propriétés ne sont pas liées à un utilisateur spécifique
-- =====================================================================================================================

-- =====================================================================================================================
-- PROPRIÉTÉ 1 : Studio moderne - Levallois-Perret
-- =====================================================================================================================

-- Propriété principale
INSERT INTO "Property" (
    id, title, description, "shortDescription", reference, "propertyType", "propertySubType", 
    "transactionType", status, condition, standing, "availableFrom", "isPublished", "isFeatured", 
    "isExclusive", "createdAt", "updatedAt"
) VALUES (
    'prop_lev_studio_01',
    'Studio lumineux proche métro Louise Michel',
    'Charmant studio de 22m² entièrement refait à neuf, situé au 2ème étage d''un immeuble sécurisé. Pièce principale avec coin cuisine équipée (plaque, frigo, micro-ondes), salle d''eau moderne avec douche italienne et WC. Parquet au sol, double vitrage. Chauffage individuel électrique. Cave. Idéal premier achat ou investissement locatif. Proche métro Louise Michel (ligne 3), commerces et bus.',
    'Studio refait à neuf, proche métro ligne 3',
    'LEV-ST-001',
    'APPARTEMENT',
    'STUDIO',
    'VENTE',
    'DISPONIBLE',
    'NEUF',
    'STANDARD',
    NOW(),
    true,
    false,
    false,
    NOW(),
    NOW()
);

-- Finance
INSERT INTO "PropertyFinance" (
    id, "propertyId", price, "pricePerMeter", charges, "chargesIncluses", "taxeFonciere", "createdAt"
) VALUES (
    'fin_lev_studio_01',
    'prop_lev_studio_01',
    145000,
    6590.91,
    45,
    false,
    380,
    NOW()
);

-- Localisation
INSERT INTO "PropertyLocation" (
    id, "propertyId", address, city, "postalCode", department, region, neighborhood, 
    latitude, longitude, "createdAt"
) VALUES (
    'loc_lev_studio_01',
    'prop_lev_studio_01',
    '18 rue Aristide Briand',
    'Levallois-Perret',
    '92300',
    'Hauts-de-Seine',
    'Île-de-France',
    'Louise Michel',
    48.8913,
    2.2890,
    NOW()
);

-- Caractéristiques
INSERT INTO "PropertyCharacteristics" (
    id, "propertyId", surface, "surfaceCarrez", rooms, bedrooms, bathrooms, toilets, 
    "toiletsSeparate", "kitchenType", "kitchenEquipee", floor, "totalFloors", 
    orientation, exposure, "viewType", "yearBuilt", "hasDoubleGlazing", "createdAt"
) VALUES (
    'char_lev_studio_01',
    'prop_lev_studio_01',
    22,
    21.5,
    1,
    0,
    1,
    1,
    false,
    'COIN_CUISINE',
    true,
    2,
    6,
    'SUD',
    'LUMINEUX',
    'SUR_RUE',
    1975,
    true,
    NOW()
);

-- Équipements
INSERT INTO "PropertyAmenities" (
    id, "propertyId", "hasCellar", "hasElevator", "hasIntercom", "hasDigicode", 
    "nearPublicTransport", "nearMetro", "metroLine", "metroDistance", "nearShops", "createdAt"
) VALUES (
    'amen_lev_studio_01',
    'prop_lev_studio_01',
    true,
    false,
    true,
    true,
    true,
    true,
    '3',
    150,
    true,
    NOW()
);

-- Énergie
INSERT INTO "PropertyEnergy" (
    id, "propertyId", "energyClass", "energyValue", "gesClass", "gesValue", 
    "heatingType", "heatingEnergy", "hasRadiator", "hotWaterType", "createdAt"
) VALUES (
    'ener_lev_studio_01',
    'prop_lev_studio_01',
    'D',
    210,
    'C',
    28,
    'INDIVIDUEL',
    'ELECTRIQUE',
    true,
    'CHAUFFE_EAU_ELECTRIQUE',
    NOW()
);

-- Copropriété
INSERT INTO "PropertyCopro" (
    id, "propertyId", "isInCopro", "coprLots", "coprCharges", "coprSyndic", "createdAt"
) VALUES (
    'copro_lev_studio_01',
    'prop_lev_studio_01',
    true,
    32,
    540,
    'Citya Immobilier',
    NOW()
);

-- =====================================================================================================================
-- PROPRIÉTÉ 2 : T2 avec balcon - Courbevoie
-- =====================================================================================================================

INSERT INTO "Property" (
    id, title, description, "shortDescription", reference, "propertyType", "propertySubType", 
    "transactionType", status, condition, standing, "availableFrom", "isPublished", "isFeatured", 
    "createdAt", "updatedAt"
) VALUES (
    'prop_cour_t2_01',
    'T2 avec balcon vue dégagée - Courbevoie Bécon',
    'Bel appartement T2 de 45m² au 5ème étage avec ascenseur. Composé d''une entrée avec placard, un séjour lumineux de 22m² avec accès balcon (5m²) orienté Sud-Ouest, une chambre de 12m², cuisine séparée équipée, salle de bain avec baignoire et WC séparé. Parquet dans les pièces de vie, faïence dans les pièces d''eau. Cave. Proche gare Bécon-les-Bruyères (Transilien L), commerces et parc de Bécon.',
    'T2 lumineux avec balcon, proche gare',
    'COUR-T2-001',
    'APPARTEMENT',
    'T2',
    'VENTE',
    'DISPONIBLE',
    'BON_ETAT',
    'BON_STANDING',
    NOW(),
    true,
    true,
    NOW(),
    NOW()
);

INSERT INTO "PropertyFinance" (
    id, "propertyId", price, "pricePerMeter", charges, "honoraires", "honorairesType", 
    "honorairesPct", "taxeFonciere"
) VALUES (
    'fin_cour_t2_01',
    'prop_cour_t2_01',
    285000,
    6333.33,
    95,
    14250,
    'acquéreur',
    5,
    680
);

INSERT INTO "PropertyLocation" (
    id, "propertyId", address, city, "postalCode", department, region, neighborhood, 
    latitude, longitude
) VALUES (
    'loc_cour_t2_01',
    'prop_cour_t2_01',
    '34 avenue Marceau',
    'Courbevoie',
    '92400',
    'Hauts-de-Seine',
    'Île-de-France',
    'Bécon',
    48.9025,
    2.2542
);

INSERT INTO "PropertyCharacteristics" (
    id, "propertyId", surface, "surfaceCarrez", "surfaceBalcon", rooms, bedrooms, bathrooms, 
    toilets, "toiletsSeparate", "kitchenType", "kitchenEquipee", floor, "totalFloors", 
    orientation, exposure, "viewType", "yearBuilt", "hasDoubleGlazing"
) VALUES (
    'char_cour_t2_01',
    'prop_cour_t2_01',
    45,
    43.8,
    5,
    2,
    1,
    1,
    1,
    true,
    'SEPAREE',
    true,
    5,
    7,
    'SUD_OUEST',
    'TRES_LUMINEUX',
    'DEGAGEE',
    1985,
    true
);

INSERT INTO "PropertyAmenities" (
    id, "propertyId", "hasBalcony", "balconyCount", "hasCellar", "hasElevator", 
    "hasIntercom", "hasDigicode", "nearPublicTransport", "nearTrain", "trainStation", 
    "trainDistance", "nearShops", "nearParks"
) VALUES (
    'amen_cour_t2_01',
    'prop_cour_t2_01',
    true,
    1,
    true,
    true,
    true,
    true,
    true,
    true,
    'Bécon-les-Bruyères',
    250,
    true,
    true
);

INSERT INTO "PropertyEnergy" (
    id, "propertyId", "energyClass", "energyValue", "gesClass", "gesValue", 
    "heatingType", "heatingEnergy", "hasRadiator", "hotWaterType"
) VALUES (
    'ener_cour_t2_01',
    'prop_cour_t2_01',
    'D',
    195,
    'D',
    32,
    'COLLECTIF',
    'GAZ',
    true,
    'COLLECTIF'
);

INSERT INTO "PropertyCopro" (
    id, "propertyId", "isInCopro", "coprLots", "coprCharges", "coprSyndic"
) VALUES (
    'copro_cour_t2_01',
    'prop_cour_t2_01',
    true,
    58,
    1140,
    'Foncia'
);

-- =====================================================================================================================
-- PROPRIÉTÉ 3 : T3 familial - Asnières-sur-Seine
-- =====================================================================================================================

INSERT INTO "Property" (
    id, title, description, "shortDescription", reference, "propertyType", "propertySubType", 
    "transactionType", status, condition, standing, "isPublished", "isFeatured", 
    "createdAt", "updatedAt"
) VALUES (
    'prop_asn_t3_01',
    'T3 familial avec terrasse - Asnières centre',
    'Magnifique appartement T3 de 68m² au dernier étage d''un immeuble de standing avec grande terrasse de 15m². Entrée, double séjour de 28m² avec accès terrasse plein Sud, cuisine semi-ouverte aménagée et équipée, deux chambres (12 et 10m²), salle de bain avec baignoire, WC séparé. Parquet chêne massif, moulures, cheminée (condamné). Cave et parking en sous-sol. Proche centre-ville, toutes commodités à pied, métro Gabriel Péri (ligne 13) à 10 minutes.',
    'T3 dernier étage avec terrasse 15m²',
    'ASN-T3-001',
    'APPARTEMENT',
    'T3',
    'VENTE',
    'DISPONIBLE',
    'TRES_BON_ETAT',
    'STANDING',
    true,
    true,
    NOW(),
    NOW()
);

INSERT INTO "PropertyFinance" (
    id, "propertyId", price, "pricePerMeter", charges, "honoraires", "honorairesType", 
    "honorairesPct", "taxeFonciere"
) VALUES (
    'fin_asn_t3_01',
    'prop_asn_t3_01',
    395000,
    5808.82,
    135,
    19750,
    'acquéreur',
    5,
    920
);

INSERT INTO "PropertyLocation" (
    id, "propertyId", address, city, "postalCode", department, region, neighborhood, 
    latitude, longitude
) VALUES (
    'loc_asn_t3_01',
    'prop_asn_t3_01',
    '67 rue du Château',
    'Asnières-sur-Seine',
    '92600',
    'Hauts-de-Seine',
    'Île-de-France',
    'Centre-ville',
    48.9140,
    2.2839
);

INSERT INTO "PropertyCharacteristics" (
    id, "propertyId", surface, "surfaceCarrez", "surfaceTerrasse", rooms, bedrooms, bathrooms, 
    toilets, "toiletsSeparate", "kitchenType", "kitchenEquipee", floor, "totalFloors", 
    "ceilingHeight", orientation, exposure, "viewType", "yearBuilt", "constructionPeriod", 
    "hasDoubleGlazing", "hasFireplace"
) VALUES (
    'char_asn_t3_01',
    'prop_asn_t3_01',
    68,
    66.5,
    15,
    3,
    2,
    1,
    1,
    true,
    'AMERICAINE',
    true,
    6,
    6,
    3.1,
    'SUD',
    'TRES_LUMINEUX',
    'DEGAGEE',
    1930,
    'DE_1914_A_1947',
    true,
    true
);

INSERT INTO "PropertyAmenities" (
    id, "propertyId", "hasTerrace", "terraceCount", "hasCellar", "hasParking", 
    "parkingSpaces", "parkingType", "hasElevator", "hasIntercom", "hasDigicode", 
    "nearPublicTransport", "nearMetro", "metroLine", "metroDistance", "nearShops"
) VALUES (
    'amen_asn_t3_01',
    'prop_asn_t3_01',
    true,
    1,
    true,
    true,
    1,
    'Souterrain',
    true,
    true,
    true,
    true,
    true,
    '13',
    600,
    true
);

INSERT INTO "PropertyEnergy" (
    id, "propertyId", "energyClass", "energyValue", "gesClass", "gesValue", 
    "heatingType", "heatingEnergy", "hasRadiator", "hotWaterType", "hasFiberOptic"
) VALUES (
    'ener_asn_t3_01',
    'prop_asn_t3_01',
    'C',
    145,
    'C',
    22,
    'COLLECTIF',
    'GAZ',
    true,
    'COLLECTIF',
    true
);

INSERT INTO "PropertyCopro" (
    id, "propertyId", "isInCopro", "coprLots", "coprCharges", "coprSyndic"
) VALUES (
    'copro_asn_t3_01',
    'prop_asn_t3_01',
    true,
    24,
    1620,
    'Laforêt'
);

-- =====================================================================================================================
-- PROPRIÉTÉ 4 : T4 spacieux - Levallois-Perret
-- =====================================================================================================================

INSERT INTO "Property" (
    id, title, description, "shortDescription", reference, "propertyType", "propertySubType", 
    "transactionType", status, condition, standing, "isPublished", "isFeatured", 
    "isExclusive", "createdAt", "updatedAt"
) VALUES (
    'prop_lev_t4_01',
    'T4 93m² - Levallois quartier Eiffel',
    'Superbe appartement T4 de 93m² au 3ème étage avec ascenseur dans une résidence sécurisée. Belle entrée, grand séjour/salle à manger de 35m² avec bow-window, cuisine équipée, trois chambres (14, 12 et 10m²), salle de bain, salle d''eau, WC séparé. Nombreux rangements. Parquet chêne, moulures. Double cave et parking. Proche métro Anatole France (ligne 3), commerces, écoles et parc.',
    'T4 spacieux quartier recherché',
    'LEV-T4-001',
    'APPARTEMENT',
    'T4',
    'VENTE',
    'DISPONIBLE',
    'BON_ETAT',
    'BON_STANDING',
    true,
    true,
    true,
    NOW(),
    NOW()
);

INSERT INTO "PropertyFinance" (
    id, "propertyId", price, "pricePerMeter", charges, "honoraires", "honorairesType", 
    "honorairesPct", "taxeFonciere"
) VALUES (
    'fin_lev_t4_01',
    'prop_lev_t4_01',
    625000,
    6720.43,
    180,
    31250,
    'acquéreur',
    5,
    1450
);

INSERT INTO "PropertyLocation" (
    id, "propertyId", address, city, "postalCode", department, region, neighborhood, 
    latitude, longitude
) VALUES (
    'loc_lev_t4_01',
    'prop_lev_t4_01',
    '45 rue Paul Vaillant-Couturier',
    'Levallois-Perret',
    '92300',
    'Hauts-de-Seine',
    'Île-de-France',
    'Eiffel',
    48.8945,
    2.2822
);

INSERT INTO "PropertyCharacteristics" (
    id, "propertyId", surface, "surfaceCarrez", "surfaceSejour", rooms, bedrooms, bathrooms, 
    "showerRooms", toilets, "toiletsSeparate", "kitchenType", "kitchenEquipee", floor, 
    "totalFloors", "ceilingHeight", orientation, exposure, "viewType", "yearBuilt", 
    "hasDoubleGlazing"
) VALUES (
    'char_lev_t4_01',
    'prop_lev_t4_01',
    93,
    91.2,
    35,
    4,
    3,
    1,
    1,
    1,
    true,
    'SEPAREE',
    true,
    3,
    7,
    2.9,
    'EST',
    'LUMINEUX',
    'SUR_RUE',
    1965,
    true
);

INSERT INTO "PropertyAmenities" (
    id, "propertyId", "hasCellar", "cellarCount", "hasParking", "parkingSpaces", 
    "parkingType", "hasElevator", "hasIntercom", "hasDigicode", "hasVideophone", 
    "nearPublicTransport", "nearMetro", "metroLine", "metroDistance", "nearShops", 
    "nearSchools"
) VALUES (
    'amen_lev_t4_01',
    'prop_lev_t4_01',
    true,
    2,
    true,
    1,
    'Box fermé',
    true,
    true,
    true,
    true,
    true,
    true,
    '3',
    300,
    true,
    true
);

INSERT INTO "PropertyEnergy" (
    id, "propertyId", "energyClass", "energyValue", "gesClass", "gesValue", 
    "heatingType", "heatingEnergy", "hasRadiator", "hotWaterType", "hasFiberOptic"
) VALUES (
    'ener_lev_t4_01',
    'prop_lev_t4_01',
    'D',
    185,
    'C',
    26,
    'COLLECTIF',
    'GAZ',
    true,
    'COLLECTIF',
    true
);

INSERT INTO "PropertyCopro" (
    id, "propertyId", "isInCopro", "coprLots", "coprCharges", "coprSyndic"
) VALUES (
    'copro_lev_t4_01',
    'prop_lev_t4_01',
    true,
    45,
    2160,
    'Citya Immobilier'
);

-- =====================================================================================================================
-- PROPRIÉTÉ 5 : T2 en location - Courbevoie
-- =====================================================================================================================

INSERT INTO "Property" (
    id, title, description, "shortDescription", reference, "propertyType", "propertySubType", 
    "transactionType", status, condition, "availableFrom", "isPublished", 
    "createdAt", "updatedAt"
) VALUES (
    'prop_cour_loc_01',
    'T2 meublé proche La Défense',
    'Beau T2 meublé de 48m² au 4ème étage avec ascenseur. Entrée, séjour avec cuisine américaine équipée (four, plaque, hotte, frigo, lave-vaisselle), une chambre, salle de bain avec baignoire, WC séparé. Nombreux rangements. Cave. À 5 minutes à pied de La Défense. Disponible immédiatement.',
    'T2 meublé disponible immédiatement',
    'COUR-LOC-001',
    'APPARTEMENT',
    'T2',
    'LOCATION',
    'DISPONIBLE',
    'BON_ETAT',
    NOW(),
    true,
    NOW(),
    NOW()
);

INSERT INTO "PropertyFinance" (
    id, "propertyId", price, charges, "chargesIncluses", depot
) VALUES (
    'fin_cour_loc_01',
    'prop_cour_loc_01',
    1450,
    120,
    false,
    2900
);

INSERT INTO "PropertyLocation" (
    id, "propertyId", address, city, "postalCode", department, region, neighborhood, 
    latitude, longitude
) VALUES (
    'loc_cour_loc_01',
    'prop_cour_loc_01',
    '89 boulevard Saint-Denis',
    'Courbevoie',
    '92400',
    'Hauts-de-Seine',
    'Île-de-France',
    'La Défense',
    48.8969,
    2.2575
);

INSERT INTO "PropertyCharacteristics" (
    id, "propertyId", surface, rooms, bedrooms, bathrooms, toilets, "toiletsSeparate", 
    "kitchenType", "kitchenEquipee", floor, "totalFloors", orientation, exposure, 
    "yearBuilt", "hasDoubleGlazing"
) VALUES (
    'char_cour_loc_01',
    'prop_cour_loc_01',
    48,
    2,
    1,
    1,
    1,
    true,
    'AMERICAINE',
    true,
    4,
    8,
    'OUEST',
    'LUMINEUX',
    1990,
    true
);

INSERT INTO "PropertyAmenities" (
    id, "propertyId", "hasCellar", "hasElevator", "hasIntercom", "hasDigicode", 
    "isFurnished", "furnishingDetails", "hasWashingMachine", "hasDishwasher", 
    "hasFridge", "hasOven", "hasMicrowave", "hasWifi", "availableForProfessionals", 
    "nearPublicTransport", "nearMetro", "metroLine", "metroDistance"
) VALUES (
    'amen_cour_loc_01',
    'prop_cour_loc_01',
    true,
    true,
    true,
    true,
    true,
    'Canapé-lit, table, chaises, armoire, lit 140x200, électroménager complet',
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    '1, TRAM T2',
    400
);

INSERT INTO "PropertyEnergy" (
    id, "propertyId", "energyClass", "energyValue", "gesClass", "gesValue", 
    "heatingType", "heatingEnergy", "hotWaterType", "hasFiberOptic"
) VALUES (
    'ener_cour_loc_01',
    'prop_cour_loc_01',
    'C',
    135,
    'B',
    18,
    'COLLECTIF',
    'GAZ',
    'COLLECTIF',
    true
);

INSERT INTO "PropertyCopro" (
    id, "propertyId", "isInCopro", "coprLots", "coprCharges"
) VALUES (
    'copro_cour_loc_01',
    'prop_cour_loc_01',
    true,
    72,
    1440
);

-- =====================================================================================================================
-- PROPRIÉTÉ 6 : Loft - Asnières-sur-Seine
-- =====================================================================================================================

INSERT INTO "Property" (
    id, title, description, "shortDescription", reference, "propertyType", "propertySubType", 
    "transactionType", status, condition, standing, "isPublished", "isFeatured", 
    "isExclusive", "createdAt", "updatedAt"
) VALUES (
    'prop_asn_loft_01',
    'Loft atypique 105m² avec mezzanine',
    'Magnifique loft atypique de 105m² avec mezzanine dans ancien atelier industriel. Volume exceptionnel avec hauteur sous plafond de 5m, grande verrière, poutres métalliques apparentes. Espace de vie principal de 70m² avec cuisine ouverte ultra équipée, coin salon/salle à manger. Mezzanine de 35m² (espace nuit + bureau). Grande salle de bain avec douche italienne et baignoire, WC séparé. Cave. Produit rare et atypique.',
    'Loft d''exception, volumes uniques',
    'ASN-LOFT-001',
    'LOFT',
    'LOFT',
    'VENTE',
    'DISPONIBLE',
    'TRES_BON_ETAT',
    'PRESTIGE',
    true,
    true,
    true,
    NOW(),
    NOW()
);

INSERT INTO "PropertyFinance" (
    id, "propertyId", price, "pricePerMeter", charges, "honoraires", "honorairesType", 
    "honorairesPct", "taxeFonciere"
) VALUES (
    'fin_asn_loft_01',
    'prop_asn_loft_01',
    595000,
    5666.67,
    85,
    29750,
    'acquéreur',
    5,
    1180
);

INSERT INTO "PropertyLocation" (
    id, "propertyId", address, city, "postalCode", department, region, neighborhood, 
    latitude, longitude
) VALUES (
    'loc_asn_loft_01',
    'prop_asn_loft_01',
    '12 rue des Bas',
    'Asnières-sur-Seine',
    '92600',
    'Hauts-de-Seine',
    'Île-de-France',
    'Les Grésillons',
    48.9205,
    2.2897
);

INSERT INTO "PropertyCharacteristics" (
    id, "propertyId", surface, "surfaceCarrez", rooms, bedrooms, bathrooms, toilets, 
    "toiletsSeparate", "kitchenType", "kitchenEquipee", floor, "totalFloors", 
    "levelsCount", "ceilingHeight", orientation, exposure, "viewType", "yearBuilt", 
    "renovatedYear", "buildingType", "hasDoubleGlazing"
) VALUES (
    'char_asn_loft_01',
    'prop_asn_loft_01',
    105,
    103,
    3,
    1,
    1,
    1,
    true,
    'OUVERTE',
    true,
    1,
    1,
    2,
    5.0,
    'SUD_EST',
    'TRES_LUMINEUX',
    'DEGAGEE',
    1920,
    2019,
    'Atelier industriel',
    true
);

INSERT INTO "PropertyAmenities" (
    id, "propertyId", "hasCellar", "hasIntercom", "hasDigicode", "hasAlarm", 
    "nearPublicTransport", "nearMetro", "metroLine", "metroDistance", "nearTrain", 
    "trainStation", "trainDistance", "nearShops"
) VALUES (
    'amen_asn_loft_01',
    'prop_asn_loft_01',
    true,
    true,
    true,
    true,
    true,
    true,
    '13',
    800,
    true,
    'Les Grésillons',
    350,
    true
);

INSERT INTO "PropertyEnergy" (
    id, "propertyId", "energyClass", "energyValue", "gesClass", "gesValue", 
    "heatingType", "heatingEnergy", "hasFloorHeating", "hotWaterType", "hasFiberOptic"
) VALUES (
    'ener_asn_loft_01',
    'prop_asn_loft_01',
    'B',
    95,
    'B',
    12,
    'INDIVIDUEL',
    'ELECTRIQUE',
    true,
    'BALLON_THERMODYNAMIQUE',
    true
);

INSERT INTO "PropertyCopro" (
    id, "propertyId", "isInCopro", "coprLots", "coprCharges", "coprSyndic"
) VALUES (
    'copro_asn_loft_01',
    'prop_asn_loft_01',
    true,
    8,
    1020,
    'Cabinet Bertrand'
);

-- =====================================================================================================================
-- PROPRIÉTÉ 7 : Duplex T5 - Levallois-Perret
-- =====================================================================================================================

INSERT INTO "Property" (
    id, title, description, "shortDescription", reference, "propertyType", "propertySubType", 
    "transactionType", status, condition, standing, "isPublished", "isFeatured", 
    "createdAt", "updatedAt"
) VALUES (
    'prop_lev_duplex_01',
    'Duplex T5 115m² dernier étage avec terrasse',
    'Splendide duplex T5 de 115m² au dernier étage d''une résidence de standing. Au 1er niveau : entrée, vaste séjour/salle à manger de 42m² avec cuisine américaine équipée, deux chambres, salle de bain, WC. Au 2ème niveau : suite parentale de 25m² avec dressing et salle d''eau, une chambre, grande terrasse tropézienne de 40m² avec vue panoramique. 2 parkings en sous-sol + cave. Prestations haut de gamme.',
    'Duplex exceptionnel avec terrasse 40m²',
    'LEV-DUP-001',
    'APPARTEMENT',
    'DUPLEX',
    'VENTE',
    'DISPONIBLE',
    'NEUF',
    'GRAND_STANDING',
    true,
    true,
    NOW(),
    NOW()
);

INSERT INTO "PropertyFinance" (
    id, "propertyId", price, "pricePerMeter", charges, "honoraires", "honorairesType", 
    "honorairesPct", "taxeFonciere"
) VALUES (
    'fin_lev_duplex_01',
    'prop_lev_duplex_01',
    895000,
    7782.61,
    210,
    44750,
    'acquéreur',
    5,
    1850
);

INSERT INTO "PropertyLocation" (
    id, "propertyId", address, city, "postalCode", department, region, neighborhood, 
    latitude, longitude
) VALUES (
    'loc_lev_duplex_01',
    'prop_lev_duplex_01',
    '78 rue Victor Hugo',
    'Levallois-Perret',
    '92300',
    'Hauts-de-Seine',
    'Île-de-France',
    'Centre',
    48.8925,
    2.2875
);

INSERT INTO "PropertyCharacteristics" (
    id, "propertyId", surface, "surfaceCarrez", "surfaceTerrasse", "surfaceSejour", 
    rooms, bedrooms, bathrooms, "showerRooms", toilets, "toiletsSeparate", 
    "kitchenType", "kitchenEquipee", floor, "totalFloors", "levelsCount", 
    "ceilingHeight", orientation, "orientationSecondary", exposure, "viewType", 
    "yearBuilt", "hasDoubleGlazing", "hasElectricShutters"
) VALUES (
    'char_lev_duplex_01',
    'prop_lev_duplex_01',
    115,
    113,
    40,
    42,
    5,
    4,
    1,
    1,
    2,
    true,
    'AMERICAINE',
    true,
    6,
    7,
    2,
    2.7,
    'SUD',
    'OUEST',
    'TRES_LUMINEUX',
    'PANORAMIQUE',
    2020,
    true,
    true
);

INSERT INTO "PropertyAmenities" (
    id, "propertyId", "hasTerrace", "hasRoofTerrace", "terraceCount", "hasCellar", 
    "hasParking", "parkingSpaces", "parkingType", "hasElevator", "hasIntercom", 
    "hasDigicode", "hasVideophone", "hasAlarm", "hasDressing", "accessPMR", 
    "nearPublicTransport", "nearMetro", "metroLine", "metroDistance", "nearShops", 
    "nearSchools"
) VALUES (
    'amen_lev_duplex_01',
    'prop_lev_duplex_01',
    true,
    true,
    1,
    true,
    true,
    2,
    'Box double fermé',
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    '3',
    200,
    true,
    true
);

INSERT INTO "PropertyEnergy" (
    id, "propertyId", "energyClass", "energyValue", "gesClass", "gesValue", 
    "heatingType", "heatingEnergy", "hasFloorHeating", "hasAirConditioning", 
    "hotWaterType", "hasFiberOptic"
) VALUES (
    'ener_lev_duplex_01',
    'prop_lev_duplex_01',
    'A',
    55,
    'A',
    4,
    'INDIVIDUEL',
    'POMPE_A_CHALEUR',
    true,
    true,
    'BALLON_THERMODYNAMIQUE',
    true
);

INSERT INTO "PropertyCopro" (
    id, "propertyId", "isInCopro", "coprLots", "coprCharges", "coprSyndic"
) VALUES (
    'copro_lev_duplex_01',
    'prop_lev_duplex_01',
    true,
    36,
    2520,
    'Nexity'
);

-- =====================================================================================================================
-- PROPRIÉTÉ 8 : Maison mitoyenne - Courbevoie
-- =====================================================================================================================

INSERT INTO "Property" (
    id, title, description, "shortDescription", reference, "propertyType", "propertySubType", 
    "transactionType", status, condition, standing, "isPublished", "isFeatured", 
    "createdAt", "updatedAt"
) VALUES (
    'prop_cour_maison_01',
    'Maison mitoyenne 135m² avec jardin',
    'Charmante maison mitoyenne de 135m² sur 3 niveaux avec jardin de 80m². RDC : entrée, séjour/salle à manger de 38m² avec accès jardin, cuisine équipée. 1er étage : 3 chambres, salle de bain, WC. 2ème étage : grande chambre sous combles de 25m² avec salle d''eau. Sous-sol total avec buanderie et cave à vin. Petit jardin arboré. Garage. Proche transports et écoles.',
    'Maison de ville avec jardin',
    'COUR-MAIS-001',
    'MAISON',
    'MAISON_MITOYENNE',
    'VENTE',
    'DISPONIBLE',
    'BON_ETAT',
    'BON_STANDING',
    true,
    true,
    NOW(),
    NOW()
);

INSERT INTO "PropertyFinance" (
    id, "propertyId", price, "pricePerMeter", "honoraires", "honorairesType", 
    "honorairesPct", "taxeFonciere"
) VALUES (
    'fin_cour_maison_01',
    'prop_cour_maison_01',
    785000,
    5814.81,
    39250,
    'acquéreur',
    5,
    1950
);

INSERT INTO "PropertyLocation" (
    id, "propertyId", address, city, "postalCode", department, region, neighborhood, 
    latitude, longitude
) VALUES (
    'loc_cour_maison_01',
    'prop_cour_maison_01',
    '23 impasse des Fauvettes',
    'Courbevoie',
    '92400',
    'Hauts-de-Seine',
    'Île-de-France',
    'Quartier résidentiel',
    48.9012,
    2.2488
);

INSERT INTO "PropertyCharacteristics" (
    id, "propertyId", surface, "surfaceTerrain", "surfaceSejour", "surfaceJardin", 
    rooms, bedrooms, bathrooms, "showerRooms", toilets, "toiletsSeparate", 
    "kitchenType", "kitchenEquipee", "levelsCount", orientation, exposure, 
    "viewType", "yearBuilt", "renovatedYear", "hasDoubleGlazing", "hasElectricShutters"
) VALUES (
    'char_cour_maison_01',
    'prop_cour_maison_01',
    135,
    180,
    38,
    80,
    5,
    4,
    1,
    1,
    2,
    true,
    'SEPAREE',
    true,
    3,
    'SUD',
    'LUMINEUX',
    'SUR_JARDIN',
    1955,
    2015,
    true,
    true
);

INSERT INTO "PropertyAmenities" (
    id, "propertyId", "hasGarden", "gardenPrivate", "hasGarage", "garageSpaces", 
    "hasCellar", "hasLaundryRoom", "hasStorage", "hasAlarm", "nearPublicTransport", 
    "nearTrain", "trainStation", "trainDistance", "nearShops", "nearSchools", 
    "nearParks", "environmentType", "noiseLevel"
) VALUES (
    'amen_cour_maison_01',
    'prop_cour_maison_01',
    true,
    true,
    true,
    1,
    true,
    true,
    true,
    true,
    true,
    true,
    'Courbevoie',
    450,
    true,
    true,
    true,
    'Résidentiel',
    'Calme'
);

INSERT INTO "PropertyEnergy" (
    id, "propertyId", "energyClass", "energyValue", "gesClass", "gesValue", 
    "heatingType", "heatingEnergy", "hasRadiator", "hasFireplace", "hotWaterType", 
    "sewageType", "hasFiberOptic"
) VALUES (
    'ener_cour_maison_01',
    'prop_cour_maison_01',
    'D',
    175,
    'C',
    24,
    'INDIVIDUEL',
    'GAZ',
    true,
    true,
    'INDIVIDUEL',
    'TOUT_A_LEGOUT',
    true
);

-- =====================================================================================================================
-- PROPRIÉTÉ 9 : T3 en location - Asnières-sur-Seine
-- =====================================================================================================================

INSERT INTO "Property" (
    id, title, description, "shortDescription", reference, "propertyType", "propertySubType", 
    "transactionType", status, condition, "availableFrom", "isPublished", 
    "createdAt", "updatedAt"
) VALUES (
    'prop_asn_loc_01',
    'T3 lumineux avec balcon - Location',
    'Bel appartement T3 de 62m² au 3ème étage avec ascenseur. Entrée avec placards, séjour de 24m² avec balcon, cuisine équipée, deux chambres, salle de bain avec baignoire, WC séparé. Cave. Proche toutes commodités, métro ligne 13 à 8 minutes. Libre à partir du 1er février.',
    'T3 avec balcon, bien situé',
    'ASN-LOC-001',
    'APPARTEMENT',
    'T3',
    'LOCATION',
    'DISPONIBLE',
    'BON_ETAT',
    '2026-02-01',
    true,
    NOW(),
    NOW()
);

INSERT INTO "PropertyFinance" (
    id, "propertyId", price, charges, "chargesIncluses", depot
) VALUES (
    'fin_asn_loc_01',
    'prop_asn_loc_01',
    1580,
    110,
    false,
    3160
);

INSERT INTO "PropertyLocation" (
    id, "propertyId", address, city, "postalCode", department, region, neighborhood, 
    latitude, longitude
) VALUES (
    'loc_asn_loc_01',
    'prop_asn_loc_01',
    '156 avenue Gabriel Péri',
    'Asnières-sur-Seine',
    '92600',
    'Hauts-de-Seine',
    'Île-de-France',
    'Gabriel Péri',
    48.9172,
    2.2816
);

INSERT INTO "PropertyCharacteristics" (
    id, "propertyId", surface, "surfaceBalcon", rooms, bedrooms, bathrooms, toilets, 
    "toiletsSeparate", "kitchenType", "kitchenEquipee", floor, "totalFloors", 
    orientation, exposure, "yearBuilt", "hasDoubleGlazing"
) VALUES (
    'char_asn_loc_01',
    'prop_asn_loc_01',
    62,
    4,
    3,
    2,
    1,
    1,
    true,
    'SEPAREE',
    true,
    3,
    6,
    'OUEST',
    'LUMINEUX',
    1978,
    true
);

INSERT INTO "PropertyAmenities" (
    id, "propertyId", "hasBalcony", "balconyCount", "hasCellar", "hasElevator", 
    "hasIntercom", "hasDigicode", "nearPublicTransport", "nearMetro", "metroLine", 
    "metroDistance", "nearShops", "nearSchools"
) VALUES (
    'amen_asn_loc_01',
    'prop_asn_loc_01',
    true,
    1,
    true,
    true,
    true,
    true,
    true,
    true,
    '13',
    500,
    true,
    true
);

INSERT INTO "PropertyEnergy" (
    id, "propertyId", "energyClass", "energyValue", "gesClass", "gesValue", 
    "heatingType", "heatingEnergy", "hotWaterType", "hasFiberOptic"
) VALUES (
    'ener_asn_loc_01',
    'prop_asn_loc_01',
    'D',
    200,
    'D',
    30,
    'COLLECTIF',
    'GAZ',
    'COLLECTIF',
    true
);

INSERT INTO "PropertyCopro" (
    id, "propertyId", "isInCopro", "coprLots", "coprCharges"
) VALUES (
    'copro_asn_loc_01',
    'prop_asn_loc_01',
    true,
    52,
    1320
);

-- =====================================================================================================================
-- PROPRIÉTÉ 10 : Penthouse - Levallois-Perret
-- =====================================================================================================================

INSERT INTO "Property" (
    id, title, description, "shortDescription", reference, "propertyType", "propertySubType", 
    "transactionType", status, condition, standing, "isPublished", "isFeatured", 
    "isExclusive", "createdAt", "updatedAt"
) VALUES (
    'prop_lev_penth_01',
    'Penthouse d''exception 150m² avec terrasse 100m²',
    'Exceptionnel penthouse de 150m² au dernier étage d''un immeuble de prestige avec immense terrasse de 100m² offrant une vue panoramique sur Paris et la Tour Eiffel. Triple exposition Sud/Est/Ouest. Vaste séjour cathédrale de 65m² avec cuisine américaine ultra équipée (Miele, Gaggenau), 3 suites avec salles de bain, bureau, dressing. Prestations luxueuses : domotique, climatisation, stores électriques. 3 parkings + cave.',
    'Penthouse prestige vue Tour Eiffel',
    'LEV-PENT-001',
    'APPARTEMENT',
    'PENTHOUSE',
    'VENTE',
    'DISPONIBLE',
    'NEUF',
    'LUXE',
    true,
    true,
    true,
    NOW(),
    NOW()
);

INSERT INTO "PropertyFinance" (
    id, "propertyId", price, "pricePerMeter", charges, "honoraires", "honorairesType", 
    "honorairesPct", "taxeFonciere"
) VALUES (
    'fin_lev_penth_01',
    'prop_lev_penth_01',
    1850000,
    12333.33,
    320,
    92500,
    'acquéreur',
    5,
    3200
);

INSERT INTO "PropertyLocation" (
    id, "propertyId", address, city, "postalCode", department, region, neighborhood, 
    latitude, longitude
) VALUES (
    'loc_lev_penth_01',
    'prop_lev_penth_01',
    '92 rue Voltaire',
    'Levallois-Perret',
    '92300',
    'Hauts-de-Seine',
    'Île-de-France',
    'Centre',
    48.8938,
    2.2845
);

INSERT INTO "PropertyCharacteristics" (
    id, "propertyId", surface, "surfaceCarrez", "surfaceTerrasse", "surfaceSejour", 
    rooms, bedrooms, bathrooms, "showerRooms", toilets, "toiletsSeparate", 
    "kitchenType", "kitchenEquipee", floor, "totalFloors", "ceilingHeight", 
    orientation, "orientationSecondary", exposure, "viewType", "viewDescription", 
    "yearBuilt", "hasDoubleGlazing", "hasElectricShutters"
) VALUES (
    'char_lev_penth_01',
    'prop_lev_penth_01',
    150,
    148,
    100,
    65,
    5,
    3,
    3,
    0,
    2,
    true,
    'AMERICAINE',
    true,
    8,
    8,
    4.2,
    'SUD',
    'EST',
    'TRES_LUMINEUX',
    'PANORAMIQUE',
    'Vue exceptionnelle sur Paris et Tour Eiffel',
    2021,
    true,
    true
);

INSERT INTO "PropertyAmenities" (
    id, "propertyId", "hasTerrace", "hasRoofTerrace", "terraceCount", "hasCellar", 
    "hasParking", "parkingSpaces", "parkingType", "hasElevator", "elevatorCount", 
    "hasIntercom", "hasDigicode", "hasVideophone", "hasAlarm", "hasSecureDoor", 
    "hasDressing", "accessPMR", "nearPublicTransport", "nearMetro", "metroLine", 
    "metroDistance", "nearShops", "environmentType", "noiseLevel"
) VALUES (
    'amen_lev_penth_01',
    'prop_lev_penth_01',
    true,
    true,
    1,
    true,
    true,
    3,
    '3 box fermés',
    true,
    2,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    '3',
    100,
    true,
    'Résidentiel prestige',
    'Très calme'
);

INSERT INTO "PropertyEnergy" (
    id, "propertyId", "energyClass", "energyValue", "gesClass", "gesValue", 
    "heatingType", "heatingEnergy", "hasFloorHeating", "hasAirConditioning", 
    "acType", "hotWaterType", "hasFiberOptic", "fiberStatus"
) VALUES (
    'ener_lev_penth_01',
    'prop_lev_penth_01',
    'A',
    42,
    'A',
    3,
    'INDIVIDUEL',
    'POMPE_A_CHALEUR',
    true,
    true,
    'Gainable multi-zones',
    'BALLON_THERMODYNAMIQUE',
    true,
    'Raccordé'
);

INSERT INTO "PropertyCopro" (
    id, "propertyId", "isInCopro", "coprLots", "coprCharges", "coprSyndic"
) VALUES (
    'copro_lev_penth_01',
    'prop_lev_penth_01',
    true,
    28,
    3840,
    'Sully Gestion'
);

-- =====================================================================================================================
-- PROPRIÉTÉ 11 : T1 - Courbevoie
-- =====================================================================================================================

INSERT INTO "Property" (
    id, title, description, "shortDescription", reference, "propertyType", "propertySubType", 
    "transactionType", status, condition, "isPublished", 
    "createdAt", "updatedAt"
) VALUES (
    'prop_cour_t1_01',
    'T1 bis rénové proche transports',
    'Joli T1 bis de 32m² rénové au 1er étage. Pièce de vie de 18m² avec coin cuisine équipée, chambre séparée de 9m², salle d''eau avec WC. Fenêtres PVC double vitrage, parquet. Cave. Idéal premier achat ou investissement. Proche gare Courbevoie et bus.',
    'T1 bis rénové, bon emplacement',
    'COUR-T1-001',
    'APPARTEMENT',
    'T1',
    'VENTE',
    'DISPONIBLE',
    'TRES_BON_ETAT',
    true,
    NOW(),
    NOW()
);

INSERT INTO "PropertyFinance" (
    id, "propertyId", price, "pricePerMeter", charges, "honoraires", "honorairesType", 
    "honorairesPct", "taxeFonciere", "isInvestment", "rentalYield"
) VALUES (
    'fin_cour_t1_01',
    'prop_cour_t1_01',
    215000,
    6718.75,
    65,
    10750,
    'acquéreur',
    5,
    480,
    true,
    4.8
);

INSERT INTO "PropertyLocation" (
    id, "propertyId", address, city, "postalCode", department, region, neighborhood, 
    latitude, longitude
) VALUES (
    'loc_cour_t1_01',
    'prop_cour_t1_01',
    '54 rue de Colombes',
    'Courbevoie',
    '92400',
    'Hauts-de-Seine',
    'Île-de-France',
    'Centre',
    48.9005,
    2.2535
);

INSERT INTO "PropertyCharacteristics" (
    id, "propertyId", surface, "surfaceCarrez", rooms, bedrooms, bathrooms, toilets, 
    "kitchenType", "kitchenEquipee", floor, "totalFloors", orientation, exposure, 
    "yearBuilt", "renovatedYear", "hasDoubleGlazing"
) VALUES (
    'char_cour_t1_01',
    'prop_cour_t1_01',
    32,
    31.2,
    2,
    1,
    1,
    1,
    'COIN_CUISINE',
    true,
    1,
    5,
    'EST',
    'LUMINEUX',
    1970,
    2022,
    true
);

INSERT INTO "PropertyAmenities" (
    id, "propertyId", "hasCellar", "hasIntercom", "hasDigicode", "nearPublicTransport", 
    "nearTrain", "trainStation", "trainDistance", "nearBus", "nearShops"
) VALUES (
    'amen_cour_t1_01',
    'prop_cour_t1_01',
    true,
    true,
    true,
    true,
    true,
    'Courbevoie',
    300,
    true,
    true
);

INSERT INTO "PropertyEnergy" (
    id, "propertyId", "energyClass", "energyValue", "gesClass", "gesValue", 
    "heatingType", "heatingEnergy", "hotWaterType", "hasFiberOptic"
) VALUES (
    'ener_cour_t1_01',
    'prop_cour_t1_01',
    'C',
    128,
    'B',
    16,
    'COLLECTIF',
    'GAZ',
    'COLLECTIF',
    true
);

INSERT INTO "PropertyCopro" (
    id, "propertyId", "isInCopro", "coprLots", "coprCharges"
) VALUES (
    'copro_cour_t1_01',
    'prop_cour_t1_01',
    true,
    38,
    780
);

-- =====================================================================================================================
-- PROPRIÉTÉ 12 : T5 familial - Asnières-sur-Seine
-- =====================================================================================================================

INSERT INTO "Property" (
    id, title, description, "shortDescription", reference, "propertyType", "propertySubType", 
    "transactionType", status, condition, standing, "isPublished", "isFeatured", 
    "createdAt", "updatedAt"
) VALUES (
    'prop_asn_t5_01',
    'T5 familial 98m² avec parking double',
    'Grand appartement familial T5 de 98m² au 2ème étage avec ascenseur. Entrée avec placards, double séjour de 32m², cuisine équipée indépendante avec coin repas, quatre chambres (de 9 à 13m²), salle de bain, salle d''eau, WC séparé. Nombreux rangements. Parquet dans chambres, carrelage dans pièces d''eau. Cave et 2 parkings. Proche écoles, commerces, RER C.',
    'T5 spacieux idéal famille',
    'ASN-T5-001',
    'APPARTEMENT',
    'T5_ET_PLUS',
    'VENTE',
    'DISPONIBLE',
    'BON_ETAT',
    'BON_STANDING',
    true,
    true,
    NOW(),
    NOW()
);

INSERT INTO "PropertyFinance" (
    id, "propertyId", price, "pricePerMeter", charges, "honoraires", "honorairesType", 
    "honorairesPct", "taxeFonciere"
) VALUES (
    'fin_asn_t5_01',
    'prop_asn_t5_01',
    485000,
    4948.98,
    165,
    24250,
    'acquéreur',
    5,
    1250
);

INSERT INTO "PropertyLocation" (
    id, "propertyId", address, city, "postalCode", department, region, neighborhood, 
    latitude, longitude
) VALUES (
    'loc_asn_t5_01',
    'prop_asn_t5_01',
    '42 boulevard Voltaire',
    'Asnières-sur-Seine',
    '92600',
    'Hauts-de-Seine',
    'Île-de-France',
    'Quartier des Quatre-Routes',
    48.9103,
    2.2945
);

INSERT INTO "PropertyCharacteristics" (
    id, "propertyId", surface, "surfaceCarrez", "surfaceSejour", rooms, bedrooms, 
    bathrooms, "showerRooms", toilets, "toiletsSeparate", "kitchenType", 
    "kitchenEquipee", floor, "totalFloors", orientation, exposure, "yearBuilt", 
    "hasDoubleGlazing"
) VALUES (
    'char_asn_t5_01',
    'prop_asn_t5_01',
    98,
    96.5,
    32,
    5,
    4,
    1,
    1,
    1,
    true,
    'SEPAREE',
    true,
    2,
    6,
    'SUD_EST',
    'LUMINEUX',
    1982,
    true
);

INSERT INTO "PropertyAmenities" (
    id, "propertyId", "hasCellar", "hasParking", "parkingSpaces", "parkingType", 
    "hasElevator", "hasIntercom", "hasDigicode", "nearPublicTransport", "nearTrain", 
    "trainStation", "trainDistance", "nearShops", "nearSchools", "schoolDetails"
) VALUES (
    'amen_asn_t5_01',
    'prop_asn_t5_01',
    true,
    true,
    2,
    'Box fermé double',
    true,
    true,
    true,
    true,
    true,
    'Asnières-sur-Seine RER C',
    400,
    true,
    true,
    'École maternelle et primaire à 200m, collège à 500m'
);

INSERT INTO "PropertyEnergy" (
    id, "propertyId", "energyClass", "energyValue", "gesClass", "gesValue", 
    "heatingType", "heatingEnergy", "hasRadiator", "hotWaterType", "hasFiberOptic"
) VALUES (
    'ener_asn_t5_01',
    'prop_asn_t5_01',
    'D',
    190,
    'C',
    27,
    'COLLECTIF',
    'GAZ',
    true,
    'COLLECTIF',
    true
);

INSERT INTO "PropertyCopro" (
    id, "propertyId", "isInCopro", "coprLots", "coprCharges", "coprSyndic"
) VALUES (
    'copro_asn_t5_01',
    'prop_asn_t5_01',
    true,
    68,
    1980,
    'Foncia'
);

-- =====================================================================================================================
-- PROPRIÉTÉ 13 : Maison individuelle - Levallois-Perret
-- =====================================================================================================================

INSERT INTO "Property" (
    id, title, description, "shortDescription", reference, "propertyType", "propertySubType", 
    "transactionType", status, condition, standing, "isPublished", "isFeatured", 
    "isExclusive", "createdAt", "updatedAt"
) VALUES (
    'prop_lev_maison_01',
    'Maison d''architecte 180m² avec piscine',
    'Rare ! Magnifique maison d''architecte de 180m² sur terrain de 300m² avec piscine chauffée. Au rez-de-chaussée : hall d''entrée, vaste séjour/salle à manger de 55m² avec baies vitrées ouvrant sur terrasse et piscine, cuisine américaine équipée haut de gamme (Miele), WC. Au 1er étage : 3 chambres dont suite parentale de 30m² avec dressing et salle de bain, salle d''eau, WC. Au 2ème étage : grande suite de 40m² avec terrasse. Sous-sol complet avec garage 2 voitures, buanderie, cave à vin. Domotique, alarme, climatisation. Prestations exceptionnelles.',
    'Maison d''architecte rare à Levallois',
    'LEV-MAIS-001',
    'MAISON',
    'MAISON_INDIVIDUELLE',
    'VENTE',
    'DISPONIBLE',
    'NEUF',
    'PRESTIGE',
    true,
    true,
    true,
    NOW(),
    NOW()
);

INSERT INTO "PropertyFinance" (
    id, "propertyId", price, "pricePerMeter", "honoraires", "honorairesType", 
    "honorairesPct", "taxeFonciere"
) VALUES (
    'fin_lev_maison_01',
    'prop_lev_maison_01',
    2450000,
    13611.11,
    122500,
    'acquéreur',
    5,
    4200
);

INSERT INTO "PropertyLocation" (
    id, "propertyId", address, city, "postalCode", department, region, neighborhood, 
    latitude, longitude
) VALUES (
    'loc_lev_maison_01',
    'prop_lev_maison_01',
    '8 impasse des Glycines',
    'Levallois-Perret',
    '92300',
    'Hauts-de-Seine',
    'Île-de-France',
    'Quartier résidentiel',
    48.8958,
    2.2812
);

INSERT INTO "PropertyCharacteristics" (
    id, "propertyId", surface, "surfaceTerrain", "surfaceSejour", "surfaceTerrasse", 
    "surfaceJardin", rooms, bedrooms, bathrooms, "showerRooms", toilets, 
    "kitchenType", "kitchenEquipee", "levelsCount", "ceilingHeight", orientation, 
    "orientationSecondary", exposure, "viewType", "yearBuilt", "buildingType", 
    "hasDoubleGlazing", "hasElectricShutters"
) VALUES (
    'char_lev_maison_01',
    'prop_lev_maison_01',
    180,
    300,
    55,
    50,
    150,
    6,
    4,
    2,
    1,
    3,
    'AMERICAINE',
    true,
    3,
    3.0,
    'SUD',
    'OUEST',
    'TRES_LUMINEUX',
    'SUR_JARDIN',
    2019,
    'Contemporaine',
    true,
    true
);

INSERT INTO "PropertyAmenities" (
    id, "propertyId", "hasGarden", "gardenPrivate", "hasTerrace", "terraceCount", 
    "hasPool", "poolType", "poolSurface", "hasGarage", "garageSpaces", "hasCellar", 
    "hasLaundryRoom", "hasDressing", "hasAlarm", "hasSecureDoor", "hasElectricGate", 
    "nearPublicTransport", "nearMetro", "metroLine", "metroDistance", "nearShops", 
    "nearSchools", "environmentType", "noiseLevel"
) VALUES (
    'amen_lev_maison_01',
    'prop_lev_maison_01',
    true,
    true,
    true,
    2,
    true,
    'Enterrée chauffée',
    25,
    true,
    2,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    '3',
    350,
    true,
    true,
    'Résidentiel calme',
    'Très calme'
);

INSERT INTO "PropertyEnergy" (
    id, "propertyId", "energyClass", "energyValue", "gesClass", "gesValue", 
    "heatingType", "heatingEnergy", "hasFloorHeating", "hasAirConditioning", 
    "acType", "hotWaterType", "sewageType", "hasFiberOptic", "fiberStatus"
) VALUES (
    'ener_lev_maison_01',
    'prop_lev_maison_01',
    'A',
    38,
    'A',
    2,
    'INDIVIDUEL',
    'POMPE_A_CHALEUR',
    true,
    true,
    'Gainable réversible',
    'BALLON_THERMODYNAMIQUE',
    'TOUT_A_LEGOUT',
    true,
    'Raccordé'
);

-- =====================================================================================================================
-- PROPRIÉTÉ 14 : Parking/Box - Courbevoie
-- =====================================================================================================================

INSERT INTO "Property" (
    id, title, description, "shortDescription", reference, "propertyType", "propertySubType", 
    "transactionType", status, "isPublished", 
    "createdAt", "updatedAt"
) VALUES (
    'prop_cour_parking_01',
    'Box fermé sécurisé - La Défense',
    'Box fermé de 15m² en sous-sol d''une résidence sécurisée. Porte électrique, éclairage, accès facile. Idéal pour stationnement voiture ou stockage. Quartier La Défense, proche métro et tramway.',
    'Box fermé proche La Défense',
    'COUR-PARK-001',
    'PARKING',
    'AUTRE',
    'VENTE',
    'DISPONIBLE',
    true,
    NOW(),
    NOW()
);

INSERT INTO "PropertyFinance" (
    id, "propertyId", price, "pricePerMeter", "taxeFonciere", "isInvestment", "rentalYield"
) VALUES (
    'fin_cour_parking_01',
    'prop_cour_parking_01',
    32000,
    2133.33,
    120,
    true,
    4.5
);

INSERT INTO "PropertyLocation" (
    id, "propertyId", address, city, "postalCode", department, region, neighborhood, 
    latitude, longitude
) VALUES (
    'loc_cour_parking_01',
    'prop_cour_parking_01',
    '105 boulevard Saint-Denis',
    'Courbevoie',
    '92400',
    'Hauts-de-Seine',
    'Île-de-France',
    'La Défense',
    48.8978,
    2.2588
);

INSERT INTO "PropertyCharacteristics" (
    id, "propertyId", surface, rooms, bedrooms, bathrooms, floor, "yearBuilt"
) VALUES (
    'char_cour_parking_01',
    'prop_cour_parking_01',
    15,
    1,
    0,
    0,
    -1,
    1995
);

INSERT INTO "PropertyAmenities" (
    id, "propertyId", "hasBox", "boxCount", "hasElectricGate", "nearPublicTransport", 
    "nearMetro", "metroLine", "metroDistance"
) VALUES (
    'amen_cour_parking_01',
    'prop_cour_parking_01',
    true,
    1,
    true,
    true,
    true,
    '1, TRAM T2',
    200
);

INSERT INTO "PropertyCopro" (
    id, "propertyId", "isInCopro", "coprLots", "coprCharges"
) VALUES (
    'copro_cour_parking_01',
    'prop_cour_parking_01',
    true,
    120,
    180
);

-- =====================================================================================================================
-- PROPRIÉTÉ 15 : Triplex exceptionnel - Asnières-sur-Seine
-- =====================================================================================================================

INSERT INTO "Property" (
    id, title, description, "shortDescription", reference, "propertyType", "propertySubType", 
    "transactionType", status, condition, standing, "isPublished", "isFeatured", 
    "isExclusive", "createdAt", "updatedAt"
) VALUES (
    'prop_asn_triplex_01',
    'Triplex d''exception 165m² avec terrasses',
    'Exceptionnel triplex de 165m² aux trois derniers étages d''un immeuble de caractère avec 3 terrasses totalisant 45m². Niveau 1 : hall d''entrée, vaste séjour/salle à manger de 50m² avec cheminée et accès terrasse de 20m², cuisine équipée. Niveau 2 : suite parentale de 35m² avec dressing, salle de bain et terrasse privative de 15m², deux chambres, salle d''eau, WC. Niveau 3 : grande pièce multifonctions de 30m² (bureau/chambre d''amis/salle de sport) avec terrasse tropézienne de 10m² et vue dégagée. Cave. Produit unique et rare. Prestations haut de gamme, parquet massif, moulures, bow-windows.',
    'Triplex rare avec 3 terrasses',
    'ASN-TRIP-001',
    'APPARTEMENT',
    'TRIPLEX',
    'VENTE',
    'DISPONIBLE',
    'TRES_BON_ETAT',
    'GRAND_STANDING',
    true,
    true,
    true,
    NOW(),
    NOW()
);

INSERT INTO "PropertyFinance" (
    id, "propertyId", price, "pricePerMeter", charges, "honoraires", "honorairesType", 
    "honorairesPct", "taxeFonciere"
) VALUES (
    'fin_asn_triplex_01',
    'prop_asn_triplex_01',
    975000,
    5909.09,
    195,
    48750,
    'acquéreur',
    5,
    2100
);

INSERT INTO "PropertyLocation" (
    id, "propertyId", address, city, "postalCode", department, region, neighborhood, 
    latitude, longitude
) VALUES (
    'loc_asn_triplex_01',
    'prop_asn_triplex_01',
    '34 quai de Seine',
    'Asnières-sur-Seine',
    '92600',
    'Hauts-de-Seine',
    'Île-de-France',
    'Bords de Seine',
    48.9115,
    2.2778
);

INSERT INTO "PropertyCharacteristics" (
    id, "propertyId", surface, "surfaceCarrez", "surfaceTerrasse", "surfaceSejour", 
    rooms, bedrooms, bathrooms, "showerRooms", toilets, "toiletsSeparate", 
    "kitchenType", "kitchenEquipee", floor, "totalFloors", "levelsCount", 
    "ceilingHeight", orientation, "orientationSecondary", exposure, "viewType", 
    "viewDescription", "yearBuilt", "constructionPeriod", "hasDoubleGlazing", 
    "hasElectricShutters", "hasFireplace"
) VALUES (
    'char_asn_triplex_01',
    'prop_asn_triplex_01',
    165,
    162,
    45,
    50,
    5,
    3,
    1,
    1,
    2,
    true,
    'SEPAREE',
    true,
    4,
    6,
    3,
    3.2,
    'SUD',
    'OUEST',
    'TRES_LUMINEUX',
    'PANORAMIQUE',
    'Vue dégagée sur la Seine et Paris',
    1910,
    'DE_1850_A_1913',
    true,
    true,
    true
);

INSERT INTO "PropertyAmenities" (
    id, "propertyId", "hasTerrace", "hasRoofTerrace", "terraceCount", "hasCellar", 
    "hasElevator", "hasIntercom", "hasDigicode", "hasVideophone", "hasDressing", 
    "nearPublicTransport", "nearMetro", "metroLine", "metroDistance", "nearTrain", 
    "trainStation", "trainDistance", "nearShops", "nearParks", "environmentType", 
    "noiseLevel"
) VALUES (
    'amen_asn_triplex_01',
    'prop_asn_triplex_01',
    true,
    true,
    3,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    '13',
    550,
    true,
    'Asnières-sur-Seine RER C',
    400,
    true,
    true,
    'Bords de Seine',
    'Calme'
);

INSERT INTO "PropertyEnergy" (
    id, "propertyId", "energyClass", "energyValue", "gesClass", "gesValue", 
    "heatingType", "heatingEnergy", "hasRadiator", "hasFireplace", "fireplaceType", 
    "hotWaterType", "hasFiberOptic", "fiberStatus"
) VALUES (
    'ener_asn_triplex_01',
    'prop_asn_triplex_01',
    'C',
    152,
    'C',
    23,
    'INDIVIDUEL',
    'GAZ',
    true,
    true,
    'Cheminée d''époque en marbre',
    'INDIVIDUEL',
    true,
    'Raccordé'
);

INSERT INTO "PropertyCopro" (
    id, "propertyId", "isInCopro", "coprLots", "coprCharges", "coprSyndic"
) VALUES (
    'copro_asn_triplex_01',
    'prop_asn_triplex_01',
    true,
    18,
    2340,
    'Cabinet Bertrand'
);

-- =====================================================================================================================
-- FIN DU SCRIPT
-- =====================================================================================================================

-- Pour exécuter ce script :
-- 1. Exécutez le script via psql : psql -U username -d database_name -f seed-properties.sql
-- 2. Ou copiez-collez les sections dans votre client PostgreSQL préféré
-- 3. Ou via Docker : docker exec -i nom_du_container psql -U username -d database_name < prisma/seed-properties.sql

-- Note : Les propriétés ne sont pas liées à un utilisateur spécifique et peuvent être gérées indépendamment.

