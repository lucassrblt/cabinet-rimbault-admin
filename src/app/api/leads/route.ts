import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-auth"
import { Prisma, LeadStatus, LeadSubject } from "@prisma/client"

export async function GET(request: Request) {
  const authResult = await requireAuth()
  if (!authResult.authenticated) {
    return authResult.response
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const subject = searchParams.get("subject")

    const whereClause: Prisma.LeadWhereInput = {}

    if (status && status !== "all") {
      whereClause.status = status as LeadStatus
    }

    if (subject && subject !== "all") {
      whereClause.subject = subject as LeadSubject
    }

    const leads = await prisma.lead.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(leads)
  } catch (error) {
    console.error("Error fetching leads:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des leads" },
      { status: 500 }
    )
  }
}
