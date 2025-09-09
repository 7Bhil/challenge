// src/app/api/ranking/challenge/[challengeId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { challengeId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const challengeId = parseInt(params.challengeId)

    if (isNaN(challengeId)) {
      return NextResponse.json(
        { error: 'ID de challenge invalide' },
        { status: 400 }
      )
    }

    // Vérifier que le challenge existe
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId }
    })

    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer les soumissions pour ce challenge avec les scores
    const submissions = await prisma.submission.findMany({
      where: {
        challengeId,
        user: {
          isActive: true,
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        scores: true
      }
    })

    // Calculer le score moyen pour chaque soumission
    const ranking = submissions.map(submission => {
      let averageScore = 0
      
      if (submission.scores.length > 0) {
        averageScore = submission.scores.reduce((sum, score) => sum + score.value, 0) / submission.scores.length
      }
      
      return {
        userId: submission.user.id,
        userName: submission.user.name,
        userEmail: submission.user.email,
        submissionId: submission.id,
        submissionUrl: submission.url,
        score: Math.round(averageScore),
        scoresCount: submission.scores.length
      }
    })

    // Trier par score décroissant
    ranking.sort((a, b) => b.score - a.score)

    // Ajouter le classement (position)
    const ranked = ranking.map((entry, index) => ({
      ...entry,
      position: index + 1
    }))

    return NextResponse.json({ 
      ranking: ranked,
      challenge: {
        id: challenge.id,
        title: challenge.title,
        type: challenge.type
      }
    })
  } catch (error) {
    console.error('Erreur API classement par challenge:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}