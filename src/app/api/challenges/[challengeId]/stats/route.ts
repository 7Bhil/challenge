// src/app/api/challenges/[challengeId]/stats/route.ts - CORRIGÉ
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteProps {
  params: Promise<{ challengeId: string }>
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    const { challengeId } = await params
    
    const challengeIdNumber = parseInt(challengeId)
    if (isNaN(challengeIdNumber)) {
      return NextResponse.json({ error: 'ID de challenge invalide' }, { status: 400 })
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeIdNumber },
      include: {
        submissions: {
          include: {
            user: {
              select: {
                id: true, // ← CORRECTION ICI
                name: true,
                email: true
              }
            },
            scores: {
              include: {
                judge: {
                  select: {
                    id: true, // ← CORRECTION ICI
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge non trouvé' }, { status: 404 })
    }

    // Calcul des statistiques
    const stats = challenge.submissions.map(submission => {
      const totalScore = submission.scores.reduce((sum, score) => sum + score.value, 0)
      const averageScore = submission.scores.length > 0 
        ? totalScore / submission.scores.length 
        : 0

      return {
        submissionId: submission.id,
        userId: submission.user.id, // ← MAINTENANT ÇA FONCTIONNE
        userName: submission.user.name,
        userEmail: submission.user.email,
        projectUrl: submission.url,
        scores: submission.scores.map(score => ({
          value: score.value,
          judgeId: score.judge.id, // ← MAINTENANT ÇA FONCTIONNE
          judgeName: score.judge.name
        })),
        totalScore,
        averageScore: Math.round(averageScore * 100) / 100,
        scoresCount: submission.scores.length,
        missingScores: 3 - submission.scores.length
      }
    }).sort((a, b) => b.averageScore - a.averageScore)

    return NextResponse.json({
      challenge: {
        id: challenge.id,
        title: challenge.title,
        type: challenge.type
      },
      stats,
      summary: {
        totalSubmissions: challenge.submissions.length,
        ratedSubmissions: challenge.submissions.filter(s => s.scores.length > 0).length,
        averageScore: stats.length > 0 ? stats.reduce((sum, stat) => sum + stat.averageScore, 0) / stats.length : 0
      }
    })

  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}