// src/app/api/ranking/general/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET( request: NextRequest) {
  try {
    console.log('📊 API Ranking General appelée')

    // Récupérer toutes les soumissions avec leurs scores
    const submissions = await prisma.submission.findMany({
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
            type: true
          }
        },
        scores: {
          select: {
            value: true
          }
        }
      },
      where: {
        scores: {
          some: {} // Seulement les soumissions notées
        }
      }
    })

    console.log(`📝 ${submissions.length} soumissions trouvées`)

    // Calculer les totaux par utilisateur
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userTotals: { [userId: number]: { total: number; count: number; user: any } } = {}

    submissions.forEach(submission => {
      const userId = submission.user.id
      const submissionTotal = submission.scores.reduce((sum, score) => sum + score.value, 0)
      const submissionAverage = submission.scores.length > 0 ? submissionTotal / submission.scores.length : 0

      if (!userTotals[userId]) {
        userTotals[userId] = {
          total: 0,
          count: 0,
          user: submission.user
        }
      }

      userTotals[userId].total += submissionAverage
      userTotals[userId].count += 1
    })

    // Convertir en array et calculer les moyennes
    const ranking = Object.values(userTotals)
      .map(entry => ({
        userId: entry.user.id,
        userName: entry.user.name,
        userEmail: entry.user.email,
        totalScore: entry.total,
        challengesCount: entry.count,
        averageScore: entry.count > 0 ? Math.round((entry.total / entry.count) * 100) / 100 : 0
      }))
      .sort((a, b) => b.averageScore - a.averageScore)

    console.log(`🏆 Classement généré pour ${ranking.length} utilisateurs`)

    return NextResponse.json({
      success: true,
      ranking,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('💥 Error generating ranking:', error)
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