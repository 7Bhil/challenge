// src/app/api/challenges/route.ts - CORRIGÉ
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeCounts = searchParams.get('includeCounts') === 'true'

    // Récupérer tous les challenges
    const challenges = await prisma.challenge.findMany({
      include: {
        creator: {
          select: {
            id: true, // ← AJOUTER id
            name: true,
            email: true
          }
        },
        ...(includeCounts && {
          _count: {
            select: {
              submissions: true
            }
          }
        })
      },
      orderBy: { createdBy: 'desc' }
    })

    return NextResponse.json({
      success: true,
      challenges: challenges.map(challenge => ({
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        theme: challenge.theme,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        type: challenge.type,
        isActive: challenge.isActive,
        createdBy: challenge.createdBy,
        creator: challenge.creator,
        ...(includeCounts && {
          submissionsCount: challenge._count?.submissions || 0
        })
      }))
    })

  } catch (error) {
    console.error('Error fetching challenges:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}