// src/app/api/auth/force-logout/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ shouldLogout: false })
    }

    const userId = parseInt(session.user.id)
    
    // Vérifier si l'utilisateur doit être déconnecté
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { shouldLogout: true }
    })

    const shouldLogout = user?.shouldLogout || false

    if (shouldLogout) {
      // Réinitialiser le flag
      await prisma.user.update({
        where: { id: userId },
        data: { shouldLogout: false }
      })
      
      console.log(`🚨 Déconnexion forcée immédiate pour l'utilisateur ${userId}`)
    }

    return NextResponse.json({ shouldLogout })

  } catch (error) {
    console.error('Error checking force logout:', error)
    return NextResponse.json({ shouldLogout: false }, { status: 500 })
  }
}