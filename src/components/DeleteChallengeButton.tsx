// src/components/DeleteChallengeButton.tsx
'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteChallenge } from '@/app/actions/challengeActions'

interface DeleteChallengeButtonProps {
  challengeId: number
}

export default function DeleteChallengeButton({ challengeId }: DeleteChallengeButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement ce challenge ?')) {
      return
    }

    startTransition(async () => {
      const result = await deleteChallenge(challengeId)
      
      if (result?.error) {
        alert(result.error)
      } else {
        router.refresh() // Recharge les données
        alert('Challenge supprimé avec succès')
      }
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-600 hover:text-red-900 disabled:opacity-50 text-sm"
    >
      {isPending ? 'Suppression...' : 'Supprimer'}
    </button>
  )
}