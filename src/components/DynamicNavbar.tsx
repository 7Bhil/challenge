// src/components/DynamicNavbar.tsx
'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

export default function DynamicNavbar() {
  useSession()
  const pathname = usePathname()

  // Ne pas afficher la navbar sur les pages de login/register
  if (pathname === '/login' || pathname === '/register') {
    return null
  }

  return <Navbar />
}