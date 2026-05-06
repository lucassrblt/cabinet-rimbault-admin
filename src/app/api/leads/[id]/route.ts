import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-auth"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth()
  if (!authResult.authenticated) {
    return authResult.response
  }

  try {
    const { id } = await params

    const lead = await prisma.lead.findUnique({
      where: { id },
    })

    if (!lead) {
      return NextResponse.json(
        { error: "Lead introuvable" },
        { status: 404 }
      )
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error("Error fetching lead:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération du lead" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth()
  if (!authResult.authenticated) {
    return authResult.response
  }

  try {
    const { id } = await params
    const body = await request.json()

    const existingLead = await prisma.lead.findUnique({
      where: { id },
    })

    if (!existingLead) {
      return NextResponse.json(
        { error: "Lead introuvable" },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}

    if (body.status) {
      const validStatuses = ["NOUVEAU", "EN_COURS", "TRAITE", "ARCHIVE"]
      if (validStatuses.includes(body.status)) {
        updateData.status = body.status
      }
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(lead)
  } catch (error) {
    console.error("Error updating lead:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du lead" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth()
  if (!authResult.authenticated) {
    return authResult.response
  }

  try {
    const { id } = await params

    const existingLead = await prisma.lead.findUnique({
      where: { id },
    })

    if (!existingLead) {
      return NextResponse.json(
        { error: "Lead introuvable" },
        { status: 404 }
      )
    }

    await prisma.lead.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting lead:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression du lead" },
      { status: 500 }
    )
  }
}
