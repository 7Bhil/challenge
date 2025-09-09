import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isJuror } from '@/lib/roles'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('📍 API Scores appelée')

    const session = await getServerSession(authOptions)
    console.log('👤 Session:', session?.user?.id)

    if (!session || !isJuror(session.user?.role ?? '')) {
      console.log('❌ Non autorisé')
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    console.log('📦 Body reçu:', body)

    const { submissionId, value } = body

    // Validation de base
    if (!submissionId || value === undefined) {
      console.log('❌ Données manquantes')
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Récupérer la soumission pour connaître le type de challenge
    console.log('🔍 Recherche soumission:', submissionId)
    const submission = await prisma.submission.findUnique({
      where: { id: parseInt(submissionId) },
      include: {
        challenge: {
          select: {
            type: true,
            title: true
          }
        }
      }
    })

    if (!submission) {
      console.log('❌ Soumission non trouvée')
      return NextResponse.json({ error: 'Soumission non trouvée' }, { status: 404 })
    }

    console.log('🎯 Type de challenge:', submission.challenge.type)

    // Validation différenciée
    const isMiniChallenge = submission.challenge.type === 'MiniChallenge'
    const maxScore = isMiniChallenge ? 10 : 100

    console.log('📊 Validation - Valeur:', value, 'Max:', maxScore)

    if (value < 0 || value > maxScore) {
      console.log('❌ Note invalide')
      return NextResponse.json({ 
        error: `La note doit être entre 0 et ${maxScore}` 
      }, { status: 400 })
    }

    const judgeId = parseInt(session.user?.id || '0')
    console.log('⚖️  Judge ID:', judgeId)

    // Vérifier si une note existe déjà
    const existingScore = await prisma.score.findFirst({
      where: {
        submissionId: parseInt(submissionId),
        judgeId
      }
    })

    console.log('📝 Note existante:', existingScore)

    let score
    if (existingScore) {
      // Mettre à jour
      score = await prisma.score.update({
        where: { id: existingScore.id },
        data: { value,
 }
      })
      console.log('✅ Note mise à jour:', score)
    } else {
      // Créer
      score = await prisma.score.create({
        data: {
          value,
          submissionId: parseInt(submissionId),
          judgeId
        }
      })
      console.log('✅ Nouvelle note créée:', score)
    }

    return NextResponse.json({ 
      success: true,
      message: existingScore ? 'Note mise à jour' : 'Note enregistrée',
      score
    })

  } catch (error) {
    console.error('💥 Erreur API scores:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    )
  }
}

// Gestion des autres méthodes
export async function GET() {
  return NextResponse.json({ error: 'Méthode non autorisée' }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ error: 'Méthode non autorisée' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Méthode non autorisée' }, { status: 405 })
}