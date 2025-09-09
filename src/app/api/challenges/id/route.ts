// src/app/api/challenges/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/roles'
import { ChallengeType } from '@prisma/client'

// GET - Récupérer un challenge spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })
    
    // Vérifier les permissions pour l'édition
    if (!token || !isAdmin(token.role as string)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const challengeId = parseInt(params.id)

    // Validation de l'ID
    if (isNaN(challengeId)) {
      return NextResponse.json({ error: 'ID de challenge invalide' }, { status: 400 })
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        creator: {
          select: { name: true, id: true }
        },
        _count: {
          select: { submissions: true }
        }
      }
    })

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge non trouvé' }, { status: 404 })
    }

    // Vérifier que l'admin peut voir ce challenge
    if (token.role !== 'SuperAdmin' && challenge.createdBy !== parseInt(token.id as string)) {
      return NextResponse.json({ 
        error: 'Vous ne pouvez accéder qu\'à vos propres challenges' 
      }, { status: 403 })
    }

    return NextResponse.json(challenge)
  } catch (error) {
    console.error('Error fetching challenge:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

// PUT - Modifier un challenge
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })
    
    if (!token || !isAdmin(token.role as string)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const challengeId = parseInt(params.id)

    // Validation de l'ID
    if (isNaN(challengeId)) {
      return NextResponse.json({ error: 'ID de challenge invalide' }, { status: 400 })
    }

    const { title, description, theme, startDate, endDate, type, isActive } = await request.json()

    // Vérifier que le challenge existe et appartient à l'admin
    const existingChallenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      select: { createdBy: true }
    })

    if (!existingChallenge) {
      return NextResponse.json({ error: 'Challenge non trouvé' }, { status: 404 })
    }

    // Les Admin ne peuvent modifier que leurs propres challenges
    if (token.role !== 'SuperAdmin' && existingChallenge.createdBy !== parseInt(token.id as string)) {
      return NextResponse.json({ 
        error: 'Vous ne pouvez modifier que vos propres challenges' 
      }, { status: 403 })
    }

    // Validation des dates
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return NextResponse.json({ 
        error: 'La date de fin doit être après la date de début' 
      }, { status: 400 })
    }

    // Mettre à jour le challenge
    const updatedChallenge = await prisma.challenge.update({
      where: { id: challengeId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(theme !== undefined && { theme }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(type && { type: type as ChallengeType }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        creator: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json({
      message: 'Challenge modifié avec succès',
      challenge: updatedChallenge
    })
  } catch (error) {
    console.error('Error updating challenge:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

// DELETE - Désactiver un challenge
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })
    
    if (!token || !isAdmin(token.role as string)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const challengeId = parseInt(params.id)

    // Validation de l'ID
    if (isNaN(challengeId)) {
      return NextResponse.json({ error: 'ID de challenge invalide' }, { status: 400 })
    }

    // Vérifier que le challenge existe et appartient à l'admin
    const existingChallenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      select: { createdBy: true }
    })

    if (!existingChallenge) {
      return NextResponse.json({ error: 'Challenge non trouvé' }, { status: 404 })
    }

    // Les Admin ne peuvent supprimer que leurs propres challenges
    if (token.role !== 'SuperAdmin' && existingChallenge.createdBy !== parseInt(token.id as string)) {
      return NextResponse.json({ 
        error: 'Vous ne pouvez supprimer que vos propres challenges' 
      }, { status: 403 })
    }

    // Désactiver le challenge (soft delete)
    await prisma.challenge.update({
      where: { id: challengeId },
      data: { isActive: false }
    })

    return NextResponse.json({ 
      message: 'Challenge désactivé avec succès'
    })
  } catch (error) {
    console.error('Error deleting challenge:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

// PATCH - Activation/désactivation partielle
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })
    
    if (!token || !isAdmin(token.role as string)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const challengeId = parseInt(params.id)

    // Validation de l'ID
    if (isNaN(challengeId)) {
      return NextResponse.json({ error: 'ID de challenge invalide' }, { status: 400 })
    }

    const { isActive } = await request.json()

    // Vérifier que le challenge existe
    const existingChallenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      select: { createdBy: true }
    })

    if (!existingChallenge) {
      return NextResponse.json({ error: 'Challenge non trouvé' }, { status: 404 })
    }

    // Les Admin ne peuvent modifier que leurs propres challenges
    if (token.role !== 'SuperAdmin' && existingChallenge.createdBy !== parseInt(token.id as string)) {
      return NextResponse.json({ 
        error: 'Vous ne pouvez modifier que vos propres challenges' 
      }, { status: 403 })
    }

    // Mettre à jour seulement le statut actif
    const updatedChallenge = await prisma.challenge.update({
      where: { id: challengeId },
      data: { isActive: Boolean(isActive) }
    })

    return NextResponse.json({
      message: `Challenge ${isActive ? 'activé' : 'désactivé'} avec succès`,
      challenge: updatedChallenge
    })
  } catch (error) {
    console.error('Error patching challenge:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}