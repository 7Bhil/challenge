// src/app/api/ranking/check/route.ts
import {  NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Vérifier s'il y a des scores dans la base de données
    const scoresCount = await prisma.score.count()
    const hasRankings = scoresCount > 0

    return NextResponse.json({ hasRankings })
  } catch (error) {
    console.error('Erreur API vérification classements:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}