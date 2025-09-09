// src/components/DeleteChallengeForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteChallengeFormProps {
  challengeId: number
}

export default function DeleteChallengeForm({ challengeId }: DeleteChallengeFormProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement ce challenge ?')) {
      return
    }

    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/challenges/${challengeId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
        alert('Challenge supprimé avec succès')
      } else {
        const error = await response.json()
        alert(error.message || 'Erreur lors de la suppression')
      }
    } catch (error) {
      alert('Erreur lors de la suppression')
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <button
        type="submit"
        disabled={isDeleting}
        className="text-red-600 hover:text-red-900 disabled:opacity-50"
      >
        {isDeleting ? 'Suppression...' : 'Supprimer'}
      </button>
    </form>
  )
}