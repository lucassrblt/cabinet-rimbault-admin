import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import prisma from "@/lib/prisma"

/**
 * Vérifie le token d'authentification admin
 */
function verifyAdminToken(request: NextRequest): { valid: boolean; reason?: string } {
  const authHeader = request.headers.get("authorization")
  
  // Log pour debug en production
  console.log("[API Users] Headers reçus:", {
    hasAuthHeader: !!authHeader,
    authHeaderPrefix: authHeader?.substring(0, 10) + "...",
  })
  
  if (!authHeader) {
    return { valid: false, reason: "Header Authorization manquant" }
  }
  
  if (!authHeader.startsWith("Bearer ")) {
    return { valid: false, reason: "Header Authorization doit commencer par 'Bearer '" }
  }
  
  const token = authHeader.substring(7) // Retire "Bearer "
  
  // Lire la variable à chaque requête (pas au niveau module)
  const adminToken = process.env.ADMIN_API_TOKEN
  
  console.log("[API Users] Vérification token:", {
    tokenLength: token.length,
    adminTokenExists: !!adminToken,
    adminTokenLength: adminToken?.length,
    // Ne PAS logger les tokens complets en production !
    tokenFirst5: token.substring(0, 5),
    adminTokenFirst5: adminToken?.substring(0, 5),
    match: token === adminToken,
  })
  
  if (!adminToken) {
    return { valid: false, reason: "ADMIN_API_TOKEN non configuré sur le serveur" }
  }
  
  if (token !== adminToken) {
    return { valid: false, reason: "Token invalide" }
  }
  
  return { valid: true }
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
    const authResult = verifyAdminToken(request)
    if (!authResult.valid) {
      console.log("[API Users POST] Échec auth:", authResult.reason)
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à effectuer cette action.", debug: authResult.reason },
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
    const authResult = verifyAdminToken(request)
    if (!authResult.valid) {
      console.log("[API Users GET] Échec auth:", authResult.reason)
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à effectuer cette action.", debug: authResult.reason },
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

