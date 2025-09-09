// src/app/api/auth/force-logout-user/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Vérifier la clé API pour la sécurité
    const authHeader = request.headers.get('Authorization')
    if (authHeader !== `Bearer ${process.env.API_INTERNAL_SECRET}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { userId } = await request.json()
    
    // Marquer l'utilisateur pour déconnexion
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { shouldLogout: true }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error forcing logout:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}