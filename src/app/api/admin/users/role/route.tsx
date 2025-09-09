// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'
import { isAdmin, canPromoteTo } from '@/lib/roles'
import { Role } from '@prisma/client'

// Map pour gérer les déconnexions forcées
const activeSessionsToInvalidate = new Map<number, boolean>()

export async function PUT(request: NextRequest) {
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

    const { userId, role } = await request.json()

    // Validation
    if (!userId || !role) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const targetUserId = parseInt(userId)
    const currentUserId = parseInt(token.id as string)

    // Empêcher de se modifier soi-même
    if (currentUserId === targetUserId) {
      return NextResponse.json({ error: 'Vous ne pouvez pas modifier votre propre rôle' }, { status: 403 })
    }

    // Vérifier que l'utilisateur a le droit de faire cette promotion
    if (!canPromoteTo(token.role as string, role)) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 })
    }

    // Vérifier que l'utilisateur cible existe
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true, email: true }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Pour les Admin, vérifier qu'ils ne modifient pas d'autres Admin ou SuperAdmin
    if (token.role === Role.Admin) {
      if (targetUser.role === Role.Admin || targetUser.role === Role.SuperAdmin) {
        return NextResponse.json({ error: 'Vous ne pouvez pas modifier un autre administrateur' }, { status: 403 })
      }
    }

    // Vérifier qu'on ne crée pas un deuxième Super Admin
    if (role === Role.SuperAdmin) {
      const existingSuperAdmins = await prisma.user.count({
        where: { 
          role: Role.SuperAdmin,
          id: { not: targetUserId } // Exclure l'utilisateur actuel s'il est déjà SuperAdmin
        }
      })
      
      if (existingSuperAdmins >= 1) {
        return NextResponse.json({ 
          error: 'Il ne peut y avoir qu\'un seul Super Admin' 
        }, { status: 400 })
      }
    }

    // Mettre à jour le rôle
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { 
        role: role as Role,
        shouldLogout: true // Marquer pour déconnexion forcée
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    })

    // Marquer pour déconnexion forcée
    activeSessionsToInvalidate.set(targetUserId, true)

    return NextResponse.json({ 
      message: 'Rôle mis à jour avec succès. L\'utilisateur sera déconnecté.',
      user: updatedUser
    })

  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    )
  }
}

// Endpoint pour récupérer les utilisateurs
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    if (!token?.id) {
      return NextResponse.json({ shouldLogout: false })
    }

    const userId = parseInt(token.id as string)
    const shouldLogout = activeSessionsToInvalidate.get(userId) || false

    // Nettoyer après vérification
    if (shouldLogout) {
      activeSessionsToInvalidate.delete(userId)
    }

    return NextResponse.json({ shouldLogout })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ shouldLogout: false })
  }
}

// Endpoint pour lister les utilisateurs (optionnel)
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    if (!token || !isAdmin(token.role as string)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        isActive: true,
        _count: {
          select: {
            submissions: true,
            challenges: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    )
  }
}