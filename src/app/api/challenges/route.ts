/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/challenges/route.ts - VERSION CORRIGÉE
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('📍 API Challenges appelée')
    
    const { searchParams } = new URL(request.url)
    const includeCounts = searchParams.get('includeCounts') === 'true'
    const activeOnly = searchParams.get('activeOnly') === 'true'

    // Construction du filtre
    const where: any = {}
    if (activeOnly) {
      where.isActive = true
    }

    // Récupérer les challenges
    const challenges = await prisma.challenge.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
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

    console.log(`📋 ${challenges.length} challenges trouvés`)

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
    console.error('💥 Error fetching challenges:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des challenges',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Gestion des autres méthodes
export async function POST() {
  return NextResponse.json({ error: 'Méthode non autorisée' }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ error: 'Méthode non autorisée' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Méthode non autorisée' }, { status: 405 })
}