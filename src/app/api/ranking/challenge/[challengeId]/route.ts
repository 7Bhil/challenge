// src/app/api/ranking/challenge/[challengeId]/route.ts - CORRIGÉ
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: Promise<{ challengeId: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // NOUVELLE SYNTAXE Next.js 15+ : await sur les params
    const { challengeId } = await context.params
    const challengeIdNumber = parseInt(challengeId)

    if (isNaN(challengeIdNumber)) {
      return NextResponse.json(
        { error: 'ID de challenge invalide' },
        { status: 400 }
      )
    }

    console.log('📊 Calcul du classement pour le challenge:', challengeIdNumber)

    // Récupérer le challenge avec toutes les soumissions et scores
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeIdNumber },
      include: {
        submissions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            scores: {
              include: {
                judge: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            },
            _count: {
              select: {
                scores: true
              }
            }
          }
        }
      }
    })

    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge non trouvé' },
        { status: 404 }
      )
    }

    // Calculer les statistiques pour chaque soumission
    const stats = challenge.submissions.map(submission => {
      const totalScore = submission.scores.reduce((sum, score) => sum + score.value, 0)
      const averageScore = submission.scores.length > 0 
        ? totalScore / submission.scores.length 
        : 0

      return {
        submissionId: submission.id,
        userId: submission.user.id,
        userName: submission.user.name,
        userEmail: submission.user.email,
        projectUrl: submission.url,
        scores: submission.scores.map(score => ({
          value: score.value,
          judgeId: score.judge.id,
          judgeName: score.judge.name
        })),
        totalScore,
        averageScore: Math.round(averageScore * 100) / 100, // 2 décimales
        scoresCount: submission.scores.length,
        missingScores: 3 - submission.scores.length // Exemple: 3 jurys attendus
      }
    }).sort((a, b) => b.averageScore - a.averageScore) // Classement

    return NextResponse.json({
      success: true,
      challenge: {
        id: challenge.id,
        title: challenge.title,
        type: challenge.type
      },
      stats,
      summary: {
        totalSubmissions: challenge.submissions.length,
        ratedSubmissions: challenge.submissions.filter(s => s.scores.length > 0).length,
        averageScore: stats.length > 0 
          ? Math.round(stats.reduce((sum, stat) => sum + stat.averageScore, 0) / stats.length * 100) / 100 
          : 0
      }
    })

  } catch (error) {
    console.error('💥 Error fetching challenge ranking:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération du classement',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Gestion des autres méthodes HTTP
export async function POST() {
  return NextResponse.json(
    { error: 'Méthode non autorisée' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Méthode non autorisée' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Méthode non autorisée' },
    { status: 405 }
  )
}