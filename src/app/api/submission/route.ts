// src/app/api/submissions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { challengeId, projectUrl } = await request.json()

    // Validation des données
    if (!challengeId || !projectUrl) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Vérifier que le challenge existe et est actif
    const challenge = await prisma.challenge.findUnique({
      where: { 
        id: parseInt(challengeId),
        isActive: true,
        startDate: { lte: new Date() }, // Challenge commencé
        endDate: { gte: new Date() }    // Pas encore terminé
      }
    })

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge non disponible' }, { status: 400 })
    }

    // Vérifier qu'il n'y a pas déjà une soumission
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        userId: parseInt(token.id ?? "0"),
        challengeId: parseInt(challengeId)
      }
    })

    if (existingSubmission) {
      return NextResponse.json({ 
        error: 'Vous avez déjà soumis un projet pour ce challenge' 
      }, { status: 400 })
    }

    // Validation de l'URL
    try {
      new URL(projectUrl)
    } catch {
      return NextResponse.json({ error: 'URL invalide' }, { status: 400 })
    }

    // Créer la soumission
    const submission = await prisma.submission.create({
      data: {
        url: projectUrl,
        userId: parseInt(token.id ?? "0"),
        challengeId: parseInt(challengeId)
      },
      include: {
        challenge: {
          select: { title: true }
        },
        user: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json(submission, { status: 201 })

  } catch (error) {
    console.error('Error creating submission:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}