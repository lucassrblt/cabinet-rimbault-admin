import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-auth"

// GET /api/evaluations/[id] - Détail d'une demande d'estimation
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

    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
    })

    if (!evaluation) {
      return NextResponse.json(
        { error: "Demande d'estimation introuvable" },
        { status: 404 }
      )
    }

    return NextResponse.json(evaluation)
  } catch (error) {
    console.error("Error fetching evaluation:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la demande d'estimation" },
      { status: 500 }
    )
  }
}

// PATCH /api/evaluations/[id] - Mettre à jour une demande d'estimation
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

    // Vérifier que l'évaluation existe
    const existingEvaluation = await prisma.evaluation.findUnique({
      where: { id },
    })

    if (!existingEvaluation) {
      return NextResponse.json(
        { error: "Demande d'estimation introuvable" },
        { status: 404 }
      )
    }

    // Préparer les données de mise à jour
    const updateData: Record<string, unknown> = {}

    // Seuls certains champs peuvent être modifiés par l'agent
    if (body.status) {
      const validStatuses = ["NOUVELLE", "EN_COURS", "TRAITEE", "ARCHIVEE"]
      if (validStatuses.includes(body.status)) {
        updateData.status = body.status
      }
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes
    }

    const evaluation = await prisma.evaluation.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(evaluation)
  } catch (error) {
    console.error("Error updating evaluation:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la demande d'estimation" },
      { status: 500 }
    )
  }
}

// DELETE /api/evaluations/[id] - Supprimer une demande d'estimation
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

    // Vérifier que l'évaluation existe
    const existingEvaluation = await prisma.evaluation.findUnique({
      where: { id },
    })

    if (!existingEvaluation) {
      return NextResponse.json(
        { error: "Demande d'estimation introuvable" },
        { status: 404 }
      )
    }

    await prisma.evaluation.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting evaluation:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la demande d'estimation" },
      { status: 500 }
    )
  }
}

