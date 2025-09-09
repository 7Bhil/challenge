// src/providers/ForceLogoutProvider.tsx
'use client'

import { useForceLogout } from '@/hooks/useForceLogout'

export function ForceLogoutProvider({ children }: { children: React.ReactNode }) {
  useForceLogout(5000)
  return <>{children}</>
}