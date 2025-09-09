// src/app/api/admin/users/notify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { isAdmin } from '@/lib/roles'

// Stocker les notifications en mémoire (en production, utilisez Redis ou DB)
const userNotifications = new Map<number, { roleChanged: boolean }>()

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    
    if (!isAdmin(token.role as string)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { userId } = await request.json()

    // Marquer l'utilisateur comme needing refresh
    userNotifications.set(parseInt(userId), { roleChanged: true })

    return NextResponse.json({ 
      message: 'Notification envoyée avec succès'
    })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const userId = parseInt(token.id as string)
    const notification = userNotifications.get(userId)

    // Retourner la notification et la supprimer
    userNotifications.delete(userId)

    return NextResponse.json({ 
      needsRefresh: notification?.roleChanged || false
    })
  } catch (error) {
    console.error('Error checking notifications:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}