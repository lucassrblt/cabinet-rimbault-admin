import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...\n")

  // Créer un utilisateur admin par défaut
  const hashedPassword = await hash("admin123", 12)
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@cabinet-rimbault.fr" },
    update: {},
    create: {
      email: "admin@cabinet-rimbault.fr",
      name: "Administrateur",
      password: hashedPassword,
    },
  })

  console.log("✅ Admin user created:", admin.email)

  // Définition des propriétés avec la nouvelle structure
  const propertiesData = [
    {
      property: {
        title: "Appartement T3 lumineux en centre-ville",
        description: "Magnifique appartement de 65m² situé au 3ème étage d'un immeuble haussmannien. Composé d'une entrée, un séjour double avec balcon, deux chambres, une cuisine équipée, une salle de bain et WC séparé. Parquet massif, moulures et cheminées d'époque. Cave et local vélo.",
        reference: "AP-001",
        propertyType: "APPARTEMENT" as const,
        propertySubType: "T3" as const,
        transactionType: "VENTE" as const,
        status: "DISPONIBLE" as const,
        condition: "BON_ETAT" as const,
        standing: "STANDING" as const,
        isPublished: true,
        isFeatured: true,
        userId: admin.id,
      },
      finance: {
        price: 189000,
        pricePerMeter: 2907.69,
        charges: 150,
        honoraires: 9450,
        honorairesType: "acquereur",
        honorairesPct: 5,
        taxeFonciere: 850,
      },
      location: {
        address: "12 rue de la République",
        city: "Lyon",
        postalCode: "69001",
        department: "Rhône",
        region: "Auvergne-Rhône-Alpes",
        neighborhood: "Terreaux",
        latitude: 45.7676,
        longitude: 4.8344,
      },
      characteristics: {
        surface: 65,
        surfaceCarrez: 63,
        surfaceBalcon: 5,
        rooms: 3,
        bedrooms: 2,
        bathrooms: 1,
        toilets: 1,
        toiletsSeparate: true,
        kitchenType: "EQUIPEE" as const,
        kitchenEquipee: true,
        floor: 3,
        totalFloors: 5,
        levelsCount: 1,
        ceilingHeight: 3.2,
        orientation: "SUD" as const,
        exposure: "LUMINEUX" as const,
        viewType: "SUR_RUE" as const,
        yearBuilt: 1890,
        buildingType: "Haussmannien",
        floorType: "Parquet massif",
        hasDoubleGlazing: true,
      },
      amenities: {
        hasBalcony: true,
        balconyCount: 1,
        hasElevator: true,
        hasCellar: true,
        hasIntercom: true,
        hasDigicode: true,
        nearPublicTransport: true,
        nearMetro: true,
        metroLine: "A, C",
        metroDistance: 200,
        nearShops: true,
      },
      energy: {
        energyClass: "D" as const,
        energyValue: 180,
        gesClass: "C" as const,
        gesValue: 25,
        heatingType: "INDIVIDUEL" as const,
        heatingEnergy: "GAZ" as const,
        hasRadiator: true,
        hotWaterType: "INDIVIDUEL" as const,
        dateReferenceEnergie: new Date("2021-01-01"),
        annualEnergyCostMin: 1000,
        annualEnergyCostMax: 1400,
      },
      copro: {
        isInCopro: true,
        coprLots: 24,
        coprCharges: 1800,
        coprSyndic: "Foncia",
      },
    },
    {
      property: {
        title: "Maison familiale avec grand jardin",
        description: "Belle maison de 120m² sur un terrain de 500m². Au rez-de-chaussée : entrée, vaste séjour/salle à manger de 40m² avec accès terrasse, cuisine aménagée et équipée, WC. À l'étage : 4 chambres, salle de bain avec baignoire et douche, WC. Garage double, dépendance. Proche écoles et commerces.",
        reference: "MA-002",
        propertyType: "MAISON" as const,
        propertySubType: "MAISON_INDIVIDUELLE" as const,
        transactionType: "VENTE" as const,
        status: "DISPONIBLE" as const,
        condition: "TRES_BON_ETAT" as const,
        standing: "BON_STANDING" as const,
        isPublished: true,
        isFeatured: true,
        userId: admin.id,
      },
      finance: {
        price: 345000,
        pricePerMeter: 2875,
        honoraires: 17250,
        honorairesType: "vendeur",
        taxeFonciere: 1500,
      },
      location: {
        address: "45 avenue Jean Jaurès",
        city: "Villeurbanne",
        postalCode: "69100",
        department: "Rhône",
        region: "Auvergne-Rhône-Alpes",
        neighborhood: "Gratte-Ciel",
        latitude: 45.7712,
        longitude: 4.8795,
      },
      characteristics: {
        surface: 120,
        surfaceTerrain: 500,
        surfaceSejour: 40,
        surfaceTerrasse: 25,
        surfaceJardin: 400,
        rooms: 5,
        bedrooms: 4,
        bathrooms: 1,
        showerRooms: 1,
        toilets: 2,
        kitchenType: "SEPAREE" as const,
        kitchenEquipee: true,
        levelsCount: 2,
        orientation: "SUD_OUEST" as const,
        exposure: "TRES_LUMINEUX" as const,
        viewType: "SUR_JARDIN" as const,
        yearBuilt: 1975,
        renovatedYear: 2018,
        hasDoubleGlazing: true,
        hasElectricShutters: true,
      },
      amenities: {
        hasGarden: true,
        gardenPrivate: true,
        hasTerrace: true,
        terraceCount: 1,
        hasGarage: true,
        garageSpaces: 2,
        hasStorage: true,
        hasLaundryRoom: true,
        hasElectricGate: true,
        nearSchools: true,
        schoolDetails: "École primaire et collège à 500m",
        nearShops: true,
        nearParks: true,
      },
      energy: {
        energyClass: "C" as const,
        energyValue: 120,
        gesClass: "B" as const,
        gesValue: 15,
        heatingType: "INDIVIDUEL" as const,
        heatingEnergy: "POMPE_A_CHALEUR" as const,
        hasFloorHeating: true,
        hotWaterType: "BALLON_THERMODYNAMIQUE" as const,
        sewageType: "TOUT_A_LEGOUT" as const,
        hasFiberOptic: true,
        fiberStatus: "Raccordé",
        dateReferenceEnergie: new Date("2021-01-01"),
        annualEnergyCostMin: 700,
        annualEnergyCostMax: 900,
      },
      copro: null,
    },
    {
      property: {
        title: "Studio meublé idéal investissement",
        description: "Studio de 25m² entièrement meublé et équipé, idéal pour investissement locatif. Kitchenette équipée, salle d'eau avec WC, coin nuit. Immeuble sécurisé avec digicode et interphone. Proche transports et université.",
        reference: "AP-003",
        propertyType: "APPARTEMENT" as const,
        propertySubType: "STUDIO" as const,
        transactionType: "LOCATION" as const,
        status: "DISPONIBLE" as const,
        condition: "BON_ETAT" as const,
        isPublished: true,
        userId: admin.id,
      },
      finance: {
        price: 650,
        charges: 50,
        chargesIncluses: false,
        depot: 650,
        isInvestment: true,
        currentRent: 650,
        rentalYield: 5.2,
      },
      location: {
        address: "8 rue Garibaldi",
        city: "Lyon",
        postalCode: "69003",
        department: "Rhône",
        region: "Auvergne-Rhône-Alpes",
        neighborhood: "Part-Dieu",
        latitude: 45.7597,
        longitude: 4.8572,
      },
      characteristics: {
        surface: 25,
        surfaceCarrez: 24.5,
        rooms: 1,
        bedrooms: 0,
        bathrooms: 1,
        kitchenType: "COIN_CUISINE" as const,
        kitchenEquipee: true,
        floor: 5,
        totalFloors: 7,
        orientation: "EST" as const,
        exposure: "LUMINEUX" as const,
        yearBuilt: 2010,
        hasDoubleGlazing: true,
      },
      amenities: {
        hasElevator: true,
        hasIntercom: true,
        hasDigicode: true,
        isFurnished: true,
        furnishingDetails: "Lit, bureau, armoire, table, chaises, équipement cuisine complet",
        hasWashingMachine: true,
        hasFridge: true,
        hasMicrowave: true,
        hasHotPlates: true,
        hasWifi: true,
        availableForStudents: true,
        nearPublicTransport: true,
        nearMetro: true,
        metroLine: "B",
        metroDistance: 300,
        nearTrain: true,
        trainStation: "Part-Dieu",
        trainDistance: 500,
      },
      energy: {
        energyClass: "B" as const,
        energyValue: 80,
        gesClass: "A" as const,
        gesValue: 5,
        heatingType: "COLLECTIF" as const,
        heatingEnergy: "ELECTRIQUE" as const,
        hasFiberOptic: true,
        fiberStatus: "Raccordé",
      },
      copro: {
        isInCopro: true,
        coprLots: 45,
        coprCharges: 600,
      },
    },
    {
      property: {
        title: "Villa contemporaine avec piscine",
        description: "Superbe villa contemporaine de 180m² avec piscine chauffée sur un terrain arboré de 800m². Au rez-de-chaussée : double séjour de 60m² avec baies vitrées donnant sur la piscine, cuisine équipée haut de gamme, suite parentale avec dressing et salle d'eau. À l'étage : 3 chambres, salle de bain, bureau. Domotique, alarme, portail électrique.",
        reference: "VI-004",
        propertyType: "VILLA" as const,
        transactionType: "VENTE" as const,
        status: "DISPONIBLE" as const,
        condition: "NEUF" as const,
        standing: "LUXE" as const,
        isPublished: true,
        isFeatured: true,
        isExclusive: true,
        userId: admin.id,
      },
      finance: {
        price: 890000,
        pricePerMeter: 4944.44,
        honoraires: 44500,
        honorairesType: "acquereur",
        honorairesPct: 5,
        taxeFonciere: 2800,
      },
      location: {
        address: "15 chemin des Hautes Bruyères",
        city: "Écully",
        postalCode: "69130",
        department: "Rhône",
        region: "Auvergne-Rhône-Alpes",
        neighborhood: "Hautes Bruyères",
        latitude: 45.7750,
        longitude: 4.7783,
      },
      characteristics: {
        surface: 180,
        surfaceTerrain: 800,
        surfaceSejour: 60,
        surfaceCuisine: 20,
        surfaceTerrasse: 80,
        surfaceJardin: 600,
        rooms: 6,
        bedrooms: 4,
        bathrooms: 2,
        showerRooms: 1,
        toilets: 3,
        kitchenType: "OUVERTE" as const,
        kitchenEquipee: true,
        levelsCount: 2,
        ceilingHeight: 2.8,
        orientation: "SUD" as const,
        orientationSecondary: "OUEST" as const,
        exposure: "TRES_LUMINEUX" as const,
        viewType: "DEGAGEE" as const,
        yearBuilt: 2022,
        buildingType: "Contemporain",
        architectStyle: "Moderne",
        floorType: "Parquet et carrelage grand format",
        windowType: "Triple vitrage",
        hasDoubleGlazing: true,
        hasElectricShutters: true,
      },
      amenities: {
        hasGarden: true,
        gardenPrivate: true,
        hasTerrace: true,
        terraceCount: 2,
        hasPool: true,
        poolType: "Enterrée chauffée",
        poolSurface: 45,
        hasGarage: true,
        garageSpaces: 2,
        hasParking: true,
        parkingSpaces: 4,
        parkingType: "Extérieur",
        hasDressing: true,
        hasLaundryRoom: true,
        hasAlarm: true,
        hasElectricGate: true,
        isGatedCommunity: false,
        nearSchools: true,
        nearParks: true,
        environmentType: "Résidentiel calme",
        noiseLevel: "Calme",
      },
      energy: {
        energyClass: "A" as const,
        energyValue: 45,
        gesClass: "A" as const,
        gesValue: 3,
        heatingType: "INDIVIDUEL" as const,
        heatingEnergy: "POMPE_A_CHALEUR" as const,
        hasFloorHeating: true,
        hasAirConditioning: true,
        acType: "Gainable réversible",
        hotWaterType: "BALLON_THERMODYNAMIQUE" as const,
        sewageType: "TOUT_A_LEGOUT" as const,
        hasFiberOptic: true,
        fiberStatus: "Raccordé",
        dateReferenceEnergie: new Date("2021-01-01"),
        annualEnergyCostMin: 400,
        annualEnergyCostMax: 600,
      },
      copro: null,
    },
    {
      property: {
        title: "Local commercial centre-ville",
        description: "Local commercial de 85m² en rez-de-chaussée, belle vitrine de 8m linéaires. Actuellement loué. Idéal investisseur ou commerce de détail. Emplacement n°1 dans rue très passante.",
        reference: "LC-005",
        propertyType: "LOCAL_COMMERCIAL" as const,
        transactionType: "VENTE" as const,
        status: "SOUS_OFFRE" as const,
        isPublished: true,
        userId: admin.id,
      },
      finance: {
        price: 195000,
        pricePerMeter: 2294.12,
        isInvestment: true,
        currentRent: 1200,
        occupancyStatus: "Loué",
        rentalYield: 7.4,
      },
      location: {
        address: "23 rue de la Bourse",
        city: "Lyon",
        postalCode: "69002",
        department: "Rhône",
        neighborhood: "Presqu'île",
      },
      characteristics: {
        surface: 85,
        rooms: 2,
        bedrooms: 0,
        bathrooms: 1,
        floor: 0,
        totalFloors: 5,
        ceilingHeight: 3.5,
        yearBuilt: 1920,
        renovatedYear: 2015,
        hasDoubleGlazing: true,
      },
      amenities: {
        hasCellar: true,
        nearPublicTransport: true,
        nearMetro: true,
        metroLine: "A",
        metroDistance: 100,
        nearShops: true,
      },
      energy: {
        energyClass: "E" as const,
        energyValue: 280,
        gesClass: "D" as const,
        gesValue: 35,
        heatingType: "INDIVIDUEL" as const,
        heatingEnergy: "ELECTRIQUE" as const,
      },
      copro: {
        isInCopro: true,
        coprLots: 12,
        coprCharges: 2400,
      },
    },
  ]

  // Créer les propriétés avec les sous-tables
  for (const data of propertiesData) {
    // Vérifier si la propriété existe déjà
    const existing = await prisma.property.findUnique({
      where: { reference: data.property.reference },
    })

    if (existing) {
      console.log(`⏭️  Property ${data.property.reference} already exists, skipping...`)
      continue
    }

    // Créer la propriété avec toutes les relations
    const property = await prisma.property.create({
      data: data.property,
    })

    // Créer les sous-tables
    if (data.finance) {
      await prisma.propertyFinance.create({
        data: { ...data.finance, propertyId: property.id },
      })
    }

    if (data.location) {
      await prisma.propertyLocation.create({
        data: { ...data.location, propertyId: property.id },
      })
    }

    if (data.characteristics) {
      await prisma.propertyCharacteristics.create({
        data: { ...data.characteristics, propertyId: property.id },
      })
    }

    if (data.amenities) {
      await prisma.propertyAmenities.create({
        data: { ...data.amenities, propertyId: property.id },
      })
    }

    if (data.energy) {
      await prisma.propertyEnergy.create({
        data: { ...data.energy, propertyId: property.id },
      })
    }

    if (data.copro) {
      await prisma.propertyCopro.create({
        data: { ...data.copro, propertyId: property.id },
      })
    }

    console.log(`✅ Property created: ${data.property.reference} - ${data.property.title}`)
  }

  console.log("\n" + "=".repeat(50))
  console.log("🎉 Seed completed successfully!")
  console.log("=".repeat(50))
  console.log("\n📋 Summary:")
  console.log(`   - ${propertiesData.length} properties created`)
  console.log(`   - 1 admin user created`)
  console.log("\n🔐 Admin credentials:")
  console.log("   Email: admin@cabinet-rimbault.fr")
  console.log("   Password: admin123")
  console.log("")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
