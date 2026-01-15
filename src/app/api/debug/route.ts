import { NextRequest, NextResponse } from "next/server"

/**
 * Route de diagnostic pour vérifier les headers reçus
 * À SUPPRIMER après debug
 */
export async function GET(request: NextRequest) {
  const headers: Record<string, string> = {}
  
  request.headers.forEach((value, key) => {
    // Masquer les valeurs sensibles mais montrer qu'ils existent
    if (key.toLowerCase() === 'authorization') {
      headers[key] = value ? `${value.substring(0, 15)}... (length: ${value.length})` : 'EMPTY'
    } else if (key.toLowerCase().includes('cookie')) {
      headers[key] = value ? `[MASKED] (length: ${value.length})` : 'EMPTY'
    } else {
      headers[key] = value
    }
  })
  
  return NextResponse.json({
    message: "Debug endpoint",
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    headers,
    env: {
      ADMIN_API_TOKEN_EXISTS: !!process.env.ADMIN_API_TOKEN,
      ADMIN_API_TOKEN_LENGTH: process.env.ADMIN_API_TOKEN?.length,
      NODE_ENV: process.env.NODE_ENV,
    }
  })
}

export async function POST(request: NextRequest) {
  // Même chose pour POST
  const headers: Record<string, string> = {}
  
  request.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'authorization') {
      headers[key] = value ? `${value.substring(0, 15)}... (length: ${value.length})` : 'EMPTY'
    } else if (key.toLowerCase().includes('cookie')) {
      headers[key] = value ? `[MASKED] (length: ${value.length})` : 'EMPTY'
    } else {
      headers[key] = value
    }
  })
  
  return NextResponse.json({
    message: "Debug endpoint POST",
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    headers,
    env: {
      ADMIN_API_TOKEN_EXISTS: !!process.env.ADMIN_API_TOKEN,
      ADMIN_API_TOKEN_LENGTH: process.env.ADMIN_API_TOKEN?.length,
    }
  })
}

