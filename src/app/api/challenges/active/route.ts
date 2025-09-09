import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// src/app/api/challenges/active/route.ts
export async function GET() {
  try {
    const now = new Date()
    
    const challenges = await prisma.challenge.findMany({
      where: { 
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now }
      },
      include: {
        creator: {
          select: { name: true }
        },
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: { startDate: 'desc' }
    })

    return NextResponse.json(challenges)
  } catch (error) {
    console.error('Error fetching active challenges:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}