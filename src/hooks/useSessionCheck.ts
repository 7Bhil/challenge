// src/hooks/useSessionCheck.ts
'use client'

import { useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function useSessionCheck() {
  const router = useRouter()

  useEffect(() => {
    const checkSessionValidity = async () => {
      try {
        const response = await fetch('/api/admin/users/role')
        const data = await response.json()

        if (data.shouldLogout) {
          console.log('🚨 Déconnexion forcée nécessaire')

          // 1. D'abord, appeler l'API de déconnexion forcée
          await fetch('/api/auth/force-logout', { method: 'POST' })
          
          // 2. Ensuite, déconnecter via NextAuth
          await signOut({ redirect: false })
          
          // 3. Rediriger vers la page de login avec message
          router.push('/login?message=Vos+permissions+ont+été+modifiées.+Veuillez+vous+reconnecter.')
          
          // 4. Forcer un rechargement complet pour vider le cache
          window.location.href = '/login?message=Vos+permissions+ont+été+modifiées.+Veuillez+vous+reconnecter.'
        }
      } catch (error) {
        console.warn('Erreur de vérification de session:', error)
      }
    }

    // Vérifier immédiatement puis périodiquement
    checkSessionValidity()
    const interval = setInterval(checkSessionValidity, 300000)

    return () => clearInterval(interval)
  }, [router])
}