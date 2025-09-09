// src/app/reconnect-required/page.tsx
'use client'

import { useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

export default function ReconnectRequired() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'Vos permissions ont été modifiées.'

  useEffect(() => {
    // Déconnecter immédiatement
    signOut({ callbackUrl: '/login' })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Reconnexion requise</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Redirection vers la page de connexion...
        </p>
      </div>
    </div>
  )
}