// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/roles'

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })
    
    // Vérifier les permissions
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    
    if (!isAdmin(token.role as string)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Récupérer tous les utilisateurs (sans les mots de passe)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}