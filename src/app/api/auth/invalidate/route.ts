// src/app/api/auth/invalidate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }


    // Ici vous pourriez ajouter la logique pour invalider la session
    // Par exemple, en utilisant une blacklist en base de données
    
    return NextResponse.json({ 
      message: 'Session invalidée avec succès'
    })
  } catch (error) {
    console.error('Error invalidating session:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}