import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-auth"

export async function GET() {
  const authResult = await requireAuth()
  if (!authResult.authenticated) {
    return authResult.response
  }

  try {
    const [leads, evaluations] = await Promise.all([
      prisma.lead.count({ where: { status: "NOUVEAU" } }),
      prisma.evaluation.count({ where: { status: "NOUVELLE" } }),
    ])

    return NextResponse.json({
      leads,
      evaluations,
      total: leads + evaluations,
    })
  } catch (error) {
    console.error("Error fetching notification counts:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des compteurs" },
      { status: 500 }
    )
  }
}
