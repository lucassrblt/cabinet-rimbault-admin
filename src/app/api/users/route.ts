import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import prisma from "@/lib/prisma"

// Token secret pour protéger cette route (défini en .env)
const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN

/**
 * Vérifie le token d'authentification admin
 */
function verifyAdminToken(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization")
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false
  }
  
  const token = authHeader.substring(7) // Retire "Bearer "
  
  if (!ADMIN_API_TOKEN) {
    console.error("[API] ADMIN_API_TOKEN non configuré dans .env")
    return false
  }
  
  return token === ADMIN_API_TOKEN
}

/**
 * POST /api/users
 * Créer un nouvel utilisateur
 * 
 * Headers requis:
 *   Authorization: Bearer <ADMIN_API_TOKEN>
 * 
 * Body:
 *   {
 *     "email": "user@example.com",
 *     "password": "motdepasse",
 *     "name": "Nom de l'utilisateur" (optionnel)
 *   }
 */
export async function POST(request: NextRequest) {
  try {
    // Vérification du token admin
    if (!verifyAdminToken(request)) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à effectuer cette action." },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { email, password, name } = body

    // Validation des champs requis
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "L'email est requis" },
        { status: 400 }
      )
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Le mot de passe est requis" },
        { status: 400 }
      )
    }

    // Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      )
    }

    // Validation du mot de passe (minimum 8 caractères)
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 }
      )
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Un utilisateur avec cet email existe déjà" },
        { status: 409 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await hash(password, 12)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      }
    })

    console.log(`[API] Utilisateur créé: ${user.email}`)

    return NextResponse.json(
      { 
        message: "Utilisateur créé avec succès",
        user 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("[API] Erreur lors de la création de l'utilisateur:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/users
 * Lister tous les utilisateurs (protégé)
 */
export async function GET(request: NextRequest) {
  try {
    // Vérification du token admin
    if (!verifyAdminToken(request)) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à effectuer cette action." },
        { status: 401 }
      )
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { properties: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ users })

  } catch (error) {
    console.error("[API] Erreur lors de la récupération des utilisateurs:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

