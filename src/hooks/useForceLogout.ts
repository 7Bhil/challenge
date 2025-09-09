import { signOut } from "next-auth/react"
import { useEffect } from "react"

// src/hooks/useForceLogout.ts
export function useForceLogout(checkInterval: number = 5000) {
  useEffect(() => {
    const checkForceLogout = async () => {
      try {
        console.log('🕵️ Checking force logout...')
        const response = await fetch('/api/auth/force-logout')
        const data = await response.json()
        console.log('📋 Force logout response:', data)
        
        if (data.shouldLogout) {
          console.log('🚨 FORCE LOGOUT - Déconnexion en cours...')
          await signOut({ redirect: true })
        }
      } catch (error) {
        console.error('❌ Error checking force logout:', error)
      }
    }

    checkForceLogout()
    const interval = setInterval(checkForceLogout, checkInterval)
    
    return () => clearInterval(interval)
  }, [checkInterval])
}