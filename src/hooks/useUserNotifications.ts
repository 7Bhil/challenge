// src/hooks/useUserNotifications.ts
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export function useUserNotifications() {
  const { data: session, update } = useSession()
  const [needsRefresh, setNeedsRefresh] = useState(false)

  useEffect(() => {
    if (!session) return

    const checkNotifications = async () => {
      try {
        const response = await fetch('/api/admin/users/notify')
        if (response.ok) {
          const data = await response.json()
          if (data.needsRefresh) {
            setNeedsRefresh(true)
            // Actualiser la session
            await update()
            setNeedsRefresh(false)
          }
        }
      } catch (error) {
        console.warn('Error checking notifications:', error)
      }
    }

    // Vérifier toutes les minutes
    const interval = setInterval(checkNotifications, 60000)
    checkNotifications() // Vérifier immédiatement

    return () => clearInterval(interval)
  }, [session, update])

  return needsRefresh
}