// src/app/auth/error/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'AccessDenied':
        return message || 'Vous n\'avez pas les permissions nécessaires pour accéder à cette page.'
      case 'Configuration':
        return 'Problème de configuration du serveur.'
      case 'Verification':
        return 'Le lien de vérification a expiré ou a déjà été utilisé.'
      default:
        return 'Une erreur est survenue lors de l\'accès à la page.'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Accès Refusé
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {getErrorMessage(error)}
          </p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Permissions modifiées
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Vos permissions d&apos;accès ont été modifiées par un administrateur.
                  Vous pouvez vous reconnecter pour actualiser votre session.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-4 justify-center">
          <Link
            href="/dashboard"
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm hover:bg-gray-300"
          >
            Retour au dashboard
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700"
          >
            Se reconnecter
          </button>
        </div>
      </div>
    </div>
  )
}