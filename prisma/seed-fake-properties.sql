-- ═══════════════════════════════════════════════════════════════════════════════
-- SEED DATA: 5 Fausses annonces immobilières
-- Exécuter avec: docker exec -i cabinet-rimbault-db psql -U postgres -d cabinet_rimbault < prisma/seed-fake-properties.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- ANNONCE 1: Appartement T3 Paris 11ème
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO "Property" (id, title, description, "shortDescription", reference, "propertyType", "propertySubType", "transactionType", status, condition, standing, "isPublished", "isFeatured", "isExclusive", "createdAt", "updatedAt", "publishedAt")
VALUES (
  'prop_paris_t3_001',
  'Superbe T3 lumineux avec balcon - Bastille',
  'Magnifique appartement de 3 pièces situé au cœur du 11ème arrondissement, à deux pas de la Place de la Bastille. Cet appartement traversant offre une luminosité exceptionnelle grâce à son double exposition Est/Ouest. Il comprend une entrée avec placard, un séjour de 25m² donnant sur un balcon filant, une cuisine équipée séparée, deux chambres dont une suite parentale avec salle d''eau, et une salle de bains avec baignoire. Parquet ancien, moulures et cheminées d''époque confèrent un charme authentique à ce bien d''exception. Cave et local vélos inclus.',
  'T3 lumineux 65m² avec balcon, double exposition, proche Bastille',
  'PAR-T3-001',
  'APPARTEMENT',
  'T3',
  'VENTE',
  'DISPONIBLE',
  'TRES_BON_ETAT',
  'STANDING',
  true,
  true,
  false,
  NOW(),
  NOW(),
  NOW()
);

INSERT INTO "PropertyFinance" (id, "propertyId", price, "pricePerMeter", charges, honoraires, "honorairesType", "honorairesPct", "taxeFonciere")
VALUES (
  'fin_paris_t3_001',
  'prop_paris_t3_001',
  585000,
  9000,
  280,
  29250,
  'CHARGE_ACQUEREUR',
  5,
  1200
);

INSERT INTO "PropertyLocation" (id, "propertyId", address, city, "postalCode", department, region, neighborhood, latitude, longitude)
VALUES (
  'loc_paris_t3_001',
  'prop_paris_t3_001',
  '45 Rue de la Roquette',
  'Paris',
  '75011',
  'Paris',
  'Île-de-France',
  'Bastille',
  48.8534,
  2.3741
);

INSERT INTO "PropertyCharacteristics" (id, "propertyId", surface, "surfaceCarrez", "surfaceSejour", "surfaceBalcon", rooms, bedrooms, bathrooms, "showerRooms", toilets, "toiletsSeparate", "kitchenType", "kitchenEquipee", floor, "totalFloors", "ceilingHeight", orientation, "orientationSecondary", exposure, "viewType", "yearBuilt", "constructionPeriod", "floorType", "hasDoubleGlazing")
VALUES (
  'char_paris_t3_001',
  'prop_paris_t3_001',
  65,
  62,
  25,
  6,
  3,
  2,
  1,
  1,
  2,
  true,
  'SEPAREE',
  true,
  4,
  6,
  3.0,
  'EST',
  'OUEST',
  'TRES_LUMINEUX',
  'DEGAGEE',
  1890,
  'DE_1850_A_1913',
  'Parquet ancien',
  true
);

INSERT INTO "PropertyAmenities" (id, "propertyId", "hasBalcony", "balconyCount", "hasCellar", "hasElevator", "hasIntercom", "hasDigicode", "nearPublicTransport", "nearMetro", "metroLine", "metroDistance", "nearShops", "nearParks")
VALUES (
  'amen_paris_t3_001',
  'prop_paris_t3_001',
  true,
  1,
  true,
  true,
  true,
  true,
  true,
  true,
  'Ligne 1, 5, 8',
  150,
  true,
  true
);

INSERT INTO "PropertyEnergy" (id, "propertyId", "energyClass", "energyValue", "gesClass", "gesValue", "heatingType", "heatingEnergy", "hasRadiator", "hotWaterType")
VALUES (
  'energy_paris_t3_001',
  'prop_paris_t3_001',
  'D',
  180,
  'C',
  25,
  'COLLECTIF',
  'GAZ',
  true,
  'COLLECTIF'
);

INSERT INTO "PropertyCopro" (id, "propertyId", "isInCopro", "coprLots", "coprCharges", "coprSyndic")
VALUES (
  'copro_paris_t3_001',
  'prop_paris_t3_001',
  true,
  45,
  3360,
  'Foncia Paris Est'
);

-- Images pour annonce 1
INSERT INTO "PropertyImage" (id, url, alt, caption, "order", "isMain", category, "propertyId", "createdAt")
VALUES
  ('img_paris_001_1', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200', 'Séjour lumineux', 'Grand séjour avec parquet et moulures', 0, true, 'SEJOUR', 'prop_paris_t3_001', NOW()),
  ('img_paris_001_2', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200', 'Cuisine équipée', 'Cuisine moderne entièrement équipée', 1, false, 'CUISINE', 'prop_paris_t3_001', NOW()),
  ('img_paris_001_3', 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200', 'Chambre principale', 'Suite parentale avec rangements', 2, false, 'CHAMBRE', 'prop_paris_t3_001', NOW()),
  ('img_paris_001_4', 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200', 'Salle de bains', 'Salle de bains avec baignoire', 3, false, 'SALLE_DE_BAIN', 'prop_paris_t3_001', NOW());

-- ═══════════════════════════════════════════════════════════════════════════════
-- ANNONCE 2: Maison familiale Lyon
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO "Property" (id, title, description, "shortDescription", reference, "propertyType", "propertySubType", "transactionType", status, condition, standing, "isPublished", "isFeatured", "isExclusive", "createdAt", "updatedAt", "publishedAt")
VALUES (
  'prop_lyon_maison_001',
  'Maison familiale 5 pièces avec jardin - Monplaisir',
  'Belle maison de ville des années 30 entièrement rénovée, située dans le quartier prisé de Monplaisir. Cette propriété de 140m² sur 3 niveaux offre un cadre de vie idéal pour une famille. Au rez-de-chaussée : entrée, grand séjour double avec cheminée, cuisine américaine équipée donnant sur une terrasse et un jardin arboré de 150m². À l''étage : 3 chambres dont une suite parentale avec dressing et salle d''eau, salle de bains familiale. Au dernier niveau : grande chambre/bureau sous combles aménagés. Garage, cave et buanderie complètent ce bien. Prestations de qualité : chauffage au sol, VMC double flux, triple vitrage.',
  'Maison 140m² rénovée, jardin 150m², 4 chambres, garage, quartier familial',
  'LYO-MAI-001',
  'MAISON',
  'MAISON_DE_VILLE',
  'VENTE',
  'DISPONIBLE',
  'TRES_BON_ETAT',
  'BON_STANDING',
  true,
  true,
  true,
  NOW(),
  NOW(),
  NOW()
);

INSERT INTO "PropertyFinance" (id, "propertyId", price, "pricePerMeter", charges, honoraires, "honorairesType", "honorairesPct", "taxeFonciere")
VALUES (
  'fin_lyon_maison_001',
  'prop_lyon_maison_001',
  695000,
  4964,
  0,
  34750,
  'CHARGE_ACQUEREUR',
  5,
  2100
);

INSERT INTO "PropertyLocation" (id, "propertyId", address, city, "postalCode", department, region, neighborhood, latitude, longitude)
VALUES (
  'loc_lyon_maison_001',
  'prop_lyon_maison_001',
  '12 Rue des Alouettes',
  'Lyon',
  '69008',
  'Rhône',
  'Auvergne-Rhône-Alpes',
  'Monplaisir',
  45.7367,
  4.8709
);

INSERT INTO "PropertyCharacteristics" (id, "propertyId", surface, "surfaceCarrez", "surfaceTerrain", "surfaceSejour", "surfaceTerrasse", "surfaceJardin", rooms, bedrooms, bathrooms, "showerRooms", toilets, "toiletsSeparate", "kitchenType", "kitchenEquipee", "totalFloors", "levelsCount", orientation, exposure, "viewType", "yearBuilt", "constructionPeriod", "renovatedYear", "floorType", "hasDoubleGlazing")
VALUES (
  'char_lyon_maison_001',
  'prop_lyon_maison_001',
  140,
  135,
  200,
  35,
  20,
  150,
  5,
  4,
  1,
  1,
  2,
  true,
  'AMERICAINE',
  true,
  3,
  3,
  'SUD',
  'LUMINEUX',
  'SUR_JARDIN',
  1935,
  'DE_1914_A_1947',
  2019,
  'Parquet chêne massif',
  true
);

INSERT INTO "PropertyAmenities" (id, "propertyId", "hasTerrace", "terraceCount", "hasGarden", "gardenPrivate", "hasGarage", "garageSpaces", "hasCellar", "hasLaundryRoom", "hasDressing", "hasIntercom", "nearPublicTransport", "nearMetro", "metroLine", "metroDistance", "nearShops", "nearSchools", "nearParks")
VALUES (
  'amen_lyon_maison_001',
  'prop_lyon_maison_001',
  true,
  1,
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
  'Ligne D',
  400,
  true,
  true,
  true
);

INSERT INTO "PropertyEnergy" (id, "propertyId", "energyClass", "energyValue", "gesClass", "gesValue", "heatingType", "heatingEnergy", "hasFloorHeating", "hasFireplace", "hotWaterType", "hasFiberOptic")
VALUES (
  'energy_lyon_maison_001',
  'prop_lyon_maison_001',
  'B',
  85,
  'A',
  8,
  'INDIVIDUEL',
  'GAZ',
  true,
  true,
  'INDIVIDUEL',
  true
);

-- Images pour annonce 2
INSERT INTO "PropertyImage" (id, url, alt, caption, "order", "isMain", category, "propertyId", "createdAt")
VALUES
  ('img_lyon_001_1', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200', 'Façade maison', 'Façade sur jardin', 0, true, 'FACADE', 'prop_lyon_maison_001', NOW()),
  ('img_lyon_001_2', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200', 'Séjour avec cheminée', 'Double séjour lumineux', 1, false, 'SEJOUR', 'prop_lyon_maison_001', NOW()),
  ('img_lyon_001_3', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200', 'Cuisine américaine', 'Cuisine ouverte équipée', 2, false, 'CUISINE', 'prop_lyon_maison_001', NOW()),
  ('img_lyon_001_4', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200', 'Jardin arboré', 'Jardin privatif de 150m²', 3, false, 'JARDIN', 'prop_lyon_maison_001', NOW());

-- ═══════════════════════════════════════════════════════════════════════════════
-- ANNONCE 3: Villa contemporaine Bordeaux
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO "Property" (id, title, description, "shortDescription", reference, "propertyType", "propertySubType", "transactionType", status, condition, standing, "isPublished", "isFeatured", "isExclusive", "createdAt", "updatedAt", "publishedAt")
VALUES (
  'prop_bordeaux_villa_001',
  'Villa d''architecte avec piscine - Caudéran',
  'Exceptionnelle villa contemporaine de 220m² construite en 2018 par un architecte de renom. Cette propriété d''exception est implantée sur un terrain paysager de 800m² avec piscine chauffée. Le rez-de-chaussée offre de vastes espaces de vie ouverts : séjour cathédrale de 60m² avec baies vitrées plein sud, cuisine design avec îlot central, suite parentale avec dressing et salle de bains spa. À l''étage : 3 chambres avec salles d''eau privatives, bureau. Prestations haut de gamme : domotique intégrale, plancher chauffant, climatisation réversible, panneaux solaires, récupérateur d''eau de pluie. Double garage.',
  'Villa architecte 220m², piscine, 4 chambres, terrain 800m², prestations luxe',
  'BDX-VIL-001',
  'VILLA',
  'MAISON_INDIVIDUELLE',
  'VENTE',
  'DISPONIBLE',
  'NEUF',
  'LUXE',
  true,
  false,
  true,
  NOW(),
  NOW(),
  NOW()
);

INSERT INTO "PropertyFinance" (id, "propertyId", price, "pricePerMeter", charges, honoraires, "honorairesType", "honorairesPct", "taxeFonciere")
VALUES (
  'fin_bordeaux_villa_001',
  'prop_bordeaux_villa_001',
  1250000,
  5682,
  0,
  50000,
  'CHARGE_ACQUEREUR',
  4,
  3500
);

INSERT INTO "PropertyLocation" (id, "propertyId", address, city, "postalCode", department, region, neighborhood, latitude, longitude)
VALUES (
  'loc_bordeaux_villa_001',
  'prop_bordeaux_villa_001',
  '8 Allée des Magnolias',
  'Bordeaux',
  '33200',
  'Gironde',
  'Nouvelle-Aquitaine',
  'Caudéran',
  44.8596,
  -0.6186
);

INSERT INTO "PropertyCharacteristics" (id, "propertyId", surface, "surfaceCarrez", "surfaceTerrain", "surfaceSejour", "surfaceTerrasse", "surfaceJardin", rooms, bedrooms, bathrooms, "showerRooms", toilets, "toiletsSeparate", "kitchenType", "kitchenEquipee", "totalFloors", "levelsCount", "ceilingHeight", orientation, exposure, "viewType", "yearBuilt", "constructionPeriod", "architectStyle", "floorType", "hasDoubleGlazing")
VALUES (
  'char_bordeaux_villa_001',
  'prop_bordeaux_villa_001',
  220,
  215,
  800,
  60,
  40,
  500,
  7,
  4,
  2,
  3,
  3,
  true,
  'OUVERTE',
  true,
  2,
  2,
  4.5,
  'SUD',
  'TRES_LUMINEUX',
  'SUR_JARDIN',
  2018,
  'APRES_2020',
  'Contemporain',
  'Béton ciré et parquet',
  true
);

INSERT INTO "PropertyAmenities" (id, "propertyId", "hasTerrace", "terraceCount", "hasGarden", "gardenPrivate", "hasPool", "poolType", "poolSurface", "hasGarage", "garageSpaces", "hasDressing", "hasAlarm", "hasElectricGate", "isGatedCommunity", "nearPublicTransport", "nearTram", "nearShops", "nearSchools")
VALUES (
  'amen_bordeaux_villa_001',
  'prop_bordeaux_villa_001',
  true,
  2,
  true,
  true,
  true,
  'Béton liner chauffée',
  45,
  true,
  2,
  true,
  true,
  true,
  false,
  true,
  true,
  true,
  true
);

INSERT INTO "PropertyEnergy" (id, "propertyId", "energyClass", "energyValue", "gesClass", "gesValue", "heatingType", "heatingEnergy", "hasFloorHeating", "hasAirConditioning", "hotWaterType", "hasFiberOptic")
VALUES (
  'energy_bordeaux_villa_001',
  'prop_bordeaux_villa_001',
  'A',
  45,
  'A',
  5,
  'INDIVIDUEL',
  'POMPE_A_CHALEUR',
  true,
  true,
  'BALLON_THERMODYNAMIQUE',
  true
);

-- Images pour annonce 3
INSERT INTO "PropertyImage" (id, url, alt, caption, "order", "isMain", category, "propertyId", "createdAt")
VALUES
  ('img_bordeaux_001_1', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200', 'Villa contemporaine', 'Vue extérieure avec piscine', 0, true, 'FACADE', 'prop_bordeaux_villa_001', NOW()),
  ('img_bordeaux_001_2', 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200', 'Séjour cathédrale', 'Grand séjour avec hauteur sous plafond', 1, false, 'SEJOUR', 'prop_bordeaux_villa_001', NOW()),
  ('img_bordeaux_001_3', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200', 'Piscine', 'Piscine chauffée et terrasse', 2, false, 'PISCINE', 'prop_bordeaux_villa_001', NOW()),
  ('img_bordeaux_001_4', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200', 'Salle de bains spa', 'Suite parentale - salle de bains', 3, false, 'SALLE_DE_BAIN', 'prop_bordeaux_villa_001', NOW());

-- ═══════════════════════════════════════════════════════════════════════════════
-- ANNONCE 4: Studio étudiant Nantes
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO "Property" (id, title, description, "shortDescription", reference, "propertyType", "propertySubType", "transactionType", status, condition, standing, "isPublished", "isFeatured", "isExclusive", "createdAt", "updatedAt", "publishedAt")
VALUES (
  'prop_nantes_studio_001',
  'Studio meublé proche université - Île de Nantes',
  'Charmant studio entièrement meublé et équipé, idéalement situé sur l''Île de Nantes à 5 minutes à pied de l''École de Design et des transports. Ce bien de 25m² au 3ème étage avec ascenseur comprend une pièce principale lumineuse avec coin nuit séparé par une verrière, un coin cuisine équipé (plaques, frigo, micro-ondes), et une salle d''eau moderne avec douche à l''italienne. Nombreux rangements. Immeuble récent avec gardien et local vélos sécurisé. Charges incluses. Parfait pour étudiant ou jeune actif.',
  'Studio 25m² meublé, proche fac et transports, charges comprises',
  'NAN-STU-001',
  'APPARTEMENT',
  'STUDIO',
  'LOCATION',
  'DISPONIBLE',
  'TRES_BON_ETAT',
  'STANDARD',
  true,
  false,
  false,
  NOW(),
  NOW(),
  NOW()
);

INSERT INTO "PropertyFinance" (id, "propertyId", price, "pricePerMeter", charges, "chargesIncluses", depot, honoraires)
VALUES (
  'fin_nantes_studio_001',
  'prop_nantes_studio_001',
  580,
  23.2,
  50,
  true,
  580,
  580
);

INSERT INTO "PropertyLocation" (id, "propertyId", address, city, "postalCode", department, region, neighborhood, latitude, longitude)
VALUES (
  'loc_nantes_studio_001',
  'prop_nantes_studio_001',
  '15 Boulevard de la Prairie au Duc',
  'Nantes',
  '44200',
  'Loire-Atlantique',
  'Pays de la Loire',
  'Île de Nantes',
  47.2074,
  -1.5643
);

INSERT INTO "PropertyCharacteristics" (id, "propertyId", surface, "surfaceCarrez", rooms, bedrooms, bathrooms, "showerRooms", toilets, "kitchenType", "kitchenEquipee", floor, "totalFloors", orientation, exposure, "viewType", "yearBuilt", "constructionPeriod", "floorType", "hasDoubleGlazing")
VALUES (
  'char_nantes_studio_001',
  'prop_nantes_studio_001',
  25,
  24,
  1,
  0,
  0,
  1,
  1,
  'COIN_CUISINE',
  true,
  3,
  5,
  'SUD_OUEST',
  'LUMINEUX',
  'DEGAGEE',
  2015,
  'DE_2011_A_2020',
  'Parquet stratifié',
  true
);

INSERT INTO "PropertyAmenities" (id, "propertyId", "hasElevator", "hasIntercom", "hasDigicode", "hasGuardian", "isFurnished", "hasWashingMachine", "hasFridge", "hasMicrowave", "hasHotPlates", "hasWifi", "availableForStudents", "nearPublicTransport", "nearTram", "nearShops", "nearSchools")
VALUES (
  'amen_nantes_studio_001',
  'prop_nantes_studio_001',
  true,
  true,
  true,
  true,
  true,
  false,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true
);

INSERT INTO "PropertyEnergy" (id, "propertyId", "energyClass", "energyValue", "gesClass", "gesValue", "heatingType", "heatingEnergy", "hasRadiator", "hotWaterType", "hasFiberOptic")
VALUES (
  'energy_nantes_studio_001',
  'prop_nantes_studio_001',
  'C',
  120,
  'B',
  15,
  'INDIVIDUEL',
  'ELECTRIQUE',
  true,
  'CHAUFFE_EAU_ELECTRIQUE',
  true
);

INSERT INTO "PropertyCopro" (id, "propertyId", "isInCopro", "coprLots", "coprCharges", "coprSyndic")
VALUES (
  'copro_nantes_studio_001',
  'prop_nantes_studio_001',
  true,
  85,
  600,
  'Citya Nantes'
);

-- Images pour annonce 4
INSERT INTO "PropertyImage" (id, url, alt, caption, "order", "isMain", category, "propertyId", "createdAt")
VALUES
  ('img_nantes_001_1', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200', 'Studio lumineux', 'Pièce principale avec coin nuit', 0, true, 'SEJOUR', 'prop_nantes_studio_001', NOW()),
  ('img_nantes_001_2', 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=1200', 'Coin cuisine', 'Cuisine équipée fonctionnelle', 1, false, 'CUISINE', 'prop_nantes_studio_001', NOW()),
  ('img_nantes_001_3', 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1200', 'Salle d''eau', 'Douche à l''italienne', 2, false, 'SALLE_DE_BAIN', 'prop_nantes_studio_001', NOW());

-- ═══════════════════════════════════════════════════════════════════════════════
-- ANNONCE 5: Appartement T4 Marseille avec terrasse vue mer
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO "Property" (id, title, description, "shortDescription", reference, "propertyType", "propertySubType", "transactionType", status, condition, standing, "isPublished", "isFeatured", "isExclusive", "createdAt", "updatedAt", "publishedAt")
VALUES (
  'prop_marseille_t4_001',
  'T4 dernier étage vue mer panoramique - Corniche Kennedy',
  'Appartement d''exception de 95m² au dernier étage d''une résidence de standing sur la Corniche Kennedy. Ce T4 traversant offre une vue mer imprenable à 180° depuis sa terrasse de 30m². Il comprend une entrée avec placard, un vaste séjour de 35m² ouvrant sur la terrasse, une cuisine américaine haut de gamme, 3 chambres lumineuses dont une suite parentale avec salle d''eau et accès terrasse, une salle de bains familiale. Climatisation réversible. 2 places de parking en sous-sol et cave. Résidence sécurisée avec piscine collective et gardien.',
  'T4 95m² dernier étage, terrasse 30m² vue mer, piscine, 2 parkings',
  'MRS-T4-001',
  'APPARTEMENT',
  'DERNIER_ETAGE',
  'VENTE',
  'DISPONIBLE',
  'TRES_BON_ETAT',
  'GRAND_STANDING',
  true,
  true,
  false,
  NOW(),
  NOW(),
  NOW()
);

INSERT INTO "PropertyFinance" (id, "propertyId", price, "pricePerMeter", charges, honoraires, "honorairesType", "honorairesPct", "taxeFonciere")
VALUES (
  'fin_marseille_t4_001',
  'prop_marseille_t4_001',
  895000,
  9421,
  450,
  44750,
  'CHARGE_ACQUEREUR',
  5,
  2800
);

INSERT INTO "PropertyLocation" (id, "propertyId", address, city, "postalCode", department, region, neighborhood, latitude, longitude)
VALUES (
  'loc_marseille_t4_001',
  'prop_marseille_t4_001',
  '289 Corniche Kennedy',
  'Marseille',
  '13007',
  'Bouches-du-Rhône',
  'Provence-Alpes-Côte d''Azur',
  'Endoume',
  43.2782,
  5.3586
);

INSERT INTO "PropertyCharacteristics" (id, "propertyId", surface, "surfaceCarrez", "surfaceSejour", "surfaceTerrasse", rooms, bedrooms, bathrooms, "showerRooms", toilets, "toiletsSeparate", "kitchenType", "kitchenEquipee", floor, "totalFloors", orientation, "orientationSecondary", exposure, "viewType", "viewDescription", "yearBuilt", "constructionPeriod", "floorType", "hasDoubleGlazing")
VALUES (
  'char_marseille_t4_001',
  'prop_marseille_t4_001',
  95,
  92,
  35,
  30,
  4,
  3,
  1,
  1,
  2,
  true,
  'AMERICAINE',
  true,
  6,
  6,
  'SUD',
  'OUEST',
  'TRES_LUMINEUX',
  'SUR_MER',
  'Vue panoramique sur la Méditerranée et les îles du Frioul',
  2008,
  'DE_2001_A_2010',
  'Carrelage grand format',
  true
);

INSERT INTO "PropertyAmenities" (id, "propertyId", "hasTerrace", "terraceCount", "hasPool", "poolType", "hasParking", "parkingType", "parkingSpaces", "hasCellar", "hasElevator", "hasIntercom", "hasDigicode", "hasVideophone", "hasGuardian", "isGatedCommunity", "nearPublicTransport", "nearBus", "nearShops", "nearBeach")
VALUES (
  'amen_marseille_t4_001',
  'prop_marseille_t4_001',
  true,
  1,
  true,
  'Piscine collective résidence',
  true,
  'Souterrain sécurisé',
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
  true,
  true
);

INSERT INTO "PropertyEnergy" (id, "propertyId", "energyClass", "energyValue", "gesClass", "gesValue", "heatingType", "heatingEnergy", "hasAirConditioning", "hotWaterType", "hasFiberOptic")
VALUES (
  'energy_marseille_t4_001',
  'prop_marseille_t4_001',
  'C',
  135,
  'B',
  18,
  'INDIVIDUEL',
  'ELECTRIQUE',
  true,
  'CHAUFFE_EAU_ELECTRIQUE',
  true
);

INSERT INTO "PropertyCopro" (id, "propertyId", "isInCopro", "coprLots", "coprCharges", "coprSyndic", "coprChargesDetails")
VALUES (
  'copro_marseille_t4_001',
  'prop_marseille_t4_001',
  true,
  32,
  5400,
  'Nexity Lamy',
  'Charges incluant gardiennage, entretien piscine, espaces verts, ascenseur'
);

-- Images pour annonce 5
INSERT INTO "PropertyImage" (id, url, alt, caption, "order", "isMain", category, "propertyId", "createdAt")
VALUES
  ('img_marseille_001_1', 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200', 'Terrasse vue mer', 'Terrasse panoramique avec vue sur la Méditerranée', 0, true, 'TERRASSE', 'prop_marseille_t4_001', NOW()),
  ('img_marseille_001_2', 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1200', 'Séjour lumineux', 'Grand séjour avec accès terrasse', 1, false, 'SEJOUR', 'prop_marseille_t4_001', NOW()),
  ('img_marseille_001_3', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200', 'Cuisine design', 'Cuisine américaine équipée', 2, false, 'CUISINE', 'prop_marseille_t4_001', NOW()),
  ('img_marseille_001_4', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200', 'Chambre parentale', 'Suite parentale avec accès terrasse', 3, false, 'CHAMBRE', 'prop_marseille_t4_001', NOW()),
  ('img_marseille_001_5', 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1200', 'Vue mer', 'Vue panoramique depuis la terrasse', 4, false, 'VUE', 'prop_marseille_t4_001', NOW());

-- ═══════════════════════════════════════════════════════════════════════════════
-- FIN DU SCRIPT
-- ═══════════════════════════════════════════════════════════════════════════════
