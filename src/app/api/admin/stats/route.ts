// src/app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/roles'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API Admin Stats appelée')
    
    // Récupérer le token avec getToken() qui fonctionne mieux dans les API Routes
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })
    
    console.log('Token reçu:', token)
    
    // Vérifier les permissions
    if (!token) {
      console.log('❌ Pas de token')
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    
    if (!isAdmin(token.role as string)) {
      console.log('❌ Pas admin, rôle:', token.role)
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    console.log('✅ Utilisateur admin détecté')

    // Récupérer les statistiques
    const [userCount, challengeCount, submissionCount, judgeCount] = await Promise.all([
      prisma.user.count(),
      prisma.challenge.count(),
      prisma.submission.count(),
      prisma.user.count({ where: { role: 'Judge' } })
    ])

    console.log('📊 Stats récupérées:', {
      userCount,
      challengeCount,
      submissionCount,
      judgeCount
    })

    return NextResponse.json({
      userCount,
      challengeCount,
      submissionCount,
      judgeCount
    })
  } catch (error) {
    console.error('❌ Error fetching admin stats:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}