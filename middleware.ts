// src/middleware.ts (extrait modifié)

import { NextRequest, NextResponse } from "next/server"

export async function forceLogoutResponse(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/login?forceLogout=1', request.url))
  // Supprimer TOUS les cookies d'auth et de session
  const cookiesToDelete = [
    'next-auth.session-token',
    'next-auth.callback-url',
    'next-auth.csrf-token',
    '__Secure-next-auth.session-token',
    '__Host-next-auth.csrf-token',
    'next-auth.pkce.code_verifier',
  ]
  
  cookiesToDelete.forEach(cookie => {
    response.cookies.set(cookie, '', {
      expires: new Date(0),
      path: '/',
    })
  })
  
  return response
}