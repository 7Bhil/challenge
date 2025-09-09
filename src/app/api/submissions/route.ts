import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

// src/app/api/submissions/route.ts (version finale)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { url, challengeId } = body

    if (!url || !challengeId) {
      return NextResponse.json(
        { error: 'URL du projet et challenge ID sont requis' }, 
        { status: 400 }
      )
    }

    // Vérification du challenge
    const challenge = await prisma.challenge.findUnique({
      where: { 
        id: parseInt(challengeId),
        isActive: true 
      }
    })

    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge non trouvé ou inactif' }, 
        { status: 404 }
      )
    }

    // Vérification des dates
    const now = new Date()
    if (now < challenge.startDate || now > challenge.endDate) {
      return NextResponse.json(
        { error: 'Le challenge n\'est pas actuellement ouvert aux soumissions' }, 
        { status: 400 }
      )
    }

    // Gestion des soumissions existantes (ÉCRASEMENT)
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        userId: parseInt(session.user.id),
        challengeId: parseInt(challengeId)
      }
    })

    if (existingSubmission) {
      // Supprime l'ancienne soumission
      await prisma.submission.delete({
        where: { id: existingSubmission.id }
      })
    }

    // Création de la nouvelle soumission
    const submission = await prisma.submission.create({
      data: {
        url,
        userId: parseInt(session.user.id),
        challengeId: parseInt(challengeId),
      }
    })

    return NextResponse.json(
      { 
        success: true,
        message: existingSubmission ? 
          'Projet mis à jour avec succès !' : 
          'Projet soumis avec succès !',
        submissionId: submission.id,
        redirect: '/dashboard?message=' + (existingSubmission ? 
          'Votre projet a été mis à jour avec succès' : 
          'Votre projet a été soumis avec succès')
      }, 
      { status: 201 }
    )

  } catch (error) {
    console.error('Erreur soumission:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    )
  }
}