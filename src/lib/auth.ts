// src/lib/auth.ts
import type { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  // Utiliser l'adapter Prisma
  adapter: PrismaAdapter(prisma),

  // Configuration des sessions JWT
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours - DÉSACTIVE la reconnexion auto
  },

  // Désactiver les pages par défaut (si vous utilisez des pages personnalisées)
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
  },

  // Providers d'authentification
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Rechercher l'utilisateur
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        // Vérifier si le compte est actif
        if (!user.isActive) {
          throw new Error('Ce compte a été désactivé')
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],

  // Callbacks pour personnaliser les tokens et sessions
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Ajouter le rôle au token lors de la connexion
      if (user) {
        token.role = user.role
        token.id = user.id
      }

      // Mettre à jour le token si la session est mise à jour
      if (trigger === 'update' && session?.role) {
        token.role = session.role
      }

      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }

      // VÉRIFICATION CRITIQUE : Contrôler si l'utilisateur doit être déconnecté
      if (session?.user?.id) {
        const userId = parseInt(session.user.id)
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { shouldLogout: true, isActive: true }
        })

        // Déconnecter si shouldLogout est true ou si le compte est inactif
        if (user?.shouldLogout || !user?.isActive) {
          // Marquer comme déconnecté
          await prisma.user.update({
            where: { id: userId },
            data: { shouldLogout: false }
          })
          
          // Forcer la déconnexion en invalidant la session
          throw new Error('SESSION_INVALIDATED')
        }
      }

      return session
    },

    async redirect({ url, baseUrl }) {
      // Empêcher les redirections externes
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },

  // Désactiver les fonctionnalités de reconnexion automatique
  useSecureCookies: process.env.NODE_ENV === 'production',
  
  // Configuration des cookies
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // Court expiration pour éviter la reconnexion auto
        maxAge: 30 * 24 * 60 * 60, // 30 jours
      },
    },
  },

  // Logger pour le debug
  logger: {
    error(code, metadata) {
      console.error('NextAuth error:', code, metadata)
    },
    warn(code) {
      console.warn('NextAuth warning:', code)
    },
    debug(code, metadata) {
      console.debug('NextAuth debug:', code, metadata)
    }
  }
}

// Types pour TypeScript
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    role?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    id?: string
  }
}