// src/app/actions/challengeActions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/roles'

export async function deleteChallenge(challengeId: number) {
  const session = await getServerSession(authOptions)
  
  if (!session || !isAdmin(session.user?.role ?? '')) {
    return { error: 'Accès non autorisé' }
  }

  try {
    // Vérifiez d'abord s'il y a des soumissions
    const submissionsCount = await prisma.submission.count({
      where: { challengeId }
    })

    if (submissionsCount > 0) {
      return {
        error: 'Impossible de supprimer ce challenge car il contient des soumissions.'
      }
    }

    // Supprimez le challenge
    await prisma.challenge.delete({
      where: { id: challengeId }
    })

    revalidatePath('/admin/challenges')
    return { success: 'Challenge supprimé avec succès' }
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return { error: 'Erreur lors de la suppression du challenge' }
  }
}