// src/app/api/submissions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteProps {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const submissionId = parseInt(id)
    if (isNaN(submissionId)) {
      return NextResponse.json({ error: 'ID de soumission invalide' }, { status: 400 })
    }

    // src/app/api/submissions/[id]/route.ts - Ajouter le type de challenge
const submission = await prisma.submission.findUnique({
  where: { id: submissionId },
  include: {
    user: {
      select: {
        id: true,
        name: true,
        email: true
      }
    },
    challenge: {
      select: {
        id: true,
        title: true,
        theme: true,
        type: true, // ← AJOUT IMPORTANT
        startDate: true,
        endDate: true
      }
    },
    scores: {
      where: {
        judgeId: parseInt(session.user.id)
      },
      select: {
        id: true,
        value: true,
        createdAt: true
      }
    }
  }
})

    if (!submission) {
      return NextResponse.json({ error: 'Soumission non trouvée' }, { status: 404 })
    }

    return NextResponse.json({ submission })

  } catch (error) {
    console.error('Error fetching submission:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}