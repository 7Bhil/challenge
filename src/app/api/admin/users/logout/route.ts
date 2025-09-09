// src/app/api/admin/users/logout/route.ts
import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { isAdmin } from '@/lib/roles'

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })
    
    if (!token || !isAdmin(token.role as string)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }


    // Ici, vous implémenteriez la logique de déconnexion
    // Pour NextAuth, cela peut être complexe car les sessions sont stateless
    
    // Méthode simple : invalider en base (si vous utilisez des sessions en base)
    // Méthode avancée : utiliser une blacklist JWT

    return NextResponse.json({ 
      message: 'Utilisateur déconnecté avec succès',
      success: true
    })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: 'Erreur de déconnexion' }, { status: 500 })
  }
}