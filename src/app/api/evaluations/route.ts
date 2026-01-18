import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-auth"
import { Prisma, EvaluationStatus, EvaluationSituation } from "@prisma/client"

export async function GET(request: Request) {
  const authResult = await requireAuth()
  if (!authResult.authenticated) {
    return authResult.response
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const postalCode = searchParams.get("postalCode")
    const situation = searchParams.get("situation")

    const whereClause: Prisma.EvaluationWhereInput = {}

    // Filtrer par statut
    if (status && status !== "all") {
      whereClause.status = status as EvaluationStatus
    }

    // Filtrer par code postal
    if (postalCode) {
      whereClause.postalCode = postalCode
    }

    // Filtrer par situation
    if (situation && situation !== "all") {
      whereClause.situation = situation as EvaluationSituation
    }

    const evaluations = await prisma.evaluation.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(evaluations)
  } catch (error) {
    console.error("Error fetching evaluations:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des demandes d'estimation" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Received evaluation request:", JSON.stringify(body, null, 2))

    const requiredFields = ["propertyType", "postalCode", "firstName", "lastName", "email"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Le champ ${field} est requis` },
          { status: 400 }
        )
      }
    }

    // Validation du code postal (5 chiffres)
    if (!/^\d{5}$/.test(body.postalCode)) {
      return NextResponse.json(
        { error: "Le code postal doit contenir 5 chiffres" },
        { status: 400 }
      )
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "L'adresse email n'est pas valide" },
        { status: 400 }
      )
    }

    // Mapper la situation
    let situation: "ACHAT" | "VENTE" | "RENSEIGNEMENT" = "RENSEIGNEMENT"
    if (body.situation) {
      const situationMap: Record<string, "ACHAT" | "VENTE" | "RENSEIGNEMENT"> = {
        achat: "ACHAT",
        vente: "VENTE",
        renseignement: "RENSEIGNEMENT",
      }
      situation = situationMap[body.situation.toLowerCase()] || "RENSEIGNEMENT"
    }

    const evaluation = await prisma.evaluation.create({
      data: {
        propertyType: body.propertyType,
        postalCode: body.postalCode,
        address: body.address || null,
        surface: body.surface || null,
        levels: body.levels || null,
        rooms: body.rooms || null,
        bedrooms: body.bedrooms || null,
        bathrooms: body.bathrooms || null,
        constructionYear: body.constructionYear || null,
        renovations: body.renovations || null,
        hasGarage: body.hasGarage === true || body.hasParking === true, // Accepter aussi hasParking
        hasPool: body.hasPool === true,
        hasGarden: body.hasGarden === true,
        hasBalcony: body.hasBalcony === true,
        hasTerrace: body.hasTerrace === true,
        situation,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone || null,
        status: "NOUVELLE",
      },
    })

    console.log("Evaluation created successfully:", evaluation.id)
    return NextResponse.json(evaluation, { status: 201 })
  } catch (error) {
    console.error("Error creating evaluation:", error)
    // Log plus de détails sur l'erreur
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return NextResponse.json(
      { 
        error: "Erreur lors de la création de la demande d'estimation",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

