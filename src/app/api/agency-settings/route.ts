import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-auth"

const DEFAULT_ID = "default"

// GET /api/agency-settings - Récupérer les paramètres de l'agence
export async function GET() {
  const authResult = await requireAuth()
  if (!authResult.authenticated) {
    return authResult.response
  }

  try {
    // Récupérer ou créer les paramètres par défaut
    let settings = await prisma.agencySettings.findUnique({
      where: { id: DEFAULT_ID },
    })

    if (!settings) {
      settings = await prisma.agencySettings.create({
        data: { id: DEFAULT_ID },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching agency settings:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des paramètres" },
      { status: 500 }
    )
  }
}

// PUT /api/agency-settings - Mettre à jour les paramètres de l'agence
export async function PUT(request: Request) {
  const authResult = await requireAuth()
  if (!authResult.authenticated) {
    return authResult.response
  }

  try {
    const body = await request.json()
    const { name, address, city, postalCode, phone, email } = body

    const settings = await prisma.agencySettings.upsert({
      where: { id: DEFAULT_ID },
      update: {
        name: name ?? "",
        address: address ?? "",
        city: city ?? "",
        postalCode: postalCode ?? "",
        phone: phone ?? "",
        email: email ?? "",
      },
      create: {
        id: DEFAULT_ID,
        name: name ?? "",
        address: address ?? "",
        city: city ?? "",
        postalCode: postalCode ?? "",
        phone: phone ?? "",
        email: email ?? "",
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error updating agency settings:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des paramètres" },
      { status: 500 }
    )
  }
}

