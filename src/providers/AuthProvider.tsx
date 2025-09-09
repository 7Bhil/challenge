// src/providers/AuthProvider.tsx
'use client'

import { SessionProvider } from 'next-auth/react'
import { ForceLogoutProvider } from './ForceLogoutProvider'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ForceLogoutProvider>
        {children}
      </ForceLogoutProvider>
    </SessionProvider>
  )
}