"use client"
import './globals.css'
import  Navbar  from '@/components/Navbar'
import { SessionProvider } from 'next-auth/react'



export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <SessionProvider>
          <Navbar />

          {children}
        </SessionProvider>
      </body>
    </html>
  )
}