// src/app/api/ranking/status/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Vérifier le classement général
    const generalScoresCount = await prisma.score.count()
    const hasGeneralRanking = generalScoresCount > 0

    // Vérifier les classements par challenge
    const challengesWithScores = await prisma.challenge.findMany({
      where: {
        submissions: {
          some: {
            scores: {
              some: {}
            }
          }
        }
      },
      select: {
        id: true
      }
    })

    const challengeRankings = challengesWithScores.map(challenge => challenge.id)

    return NextResponse.json({
      hasGeneralRanking,
      challengeRankings
    })
  } catch (error) {
    console.error('Erreur API statut classements:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}