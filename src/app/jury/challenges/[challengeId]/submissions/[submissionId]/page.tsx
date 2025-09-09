// src/app/jury/challenges/[id]/submissions/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Submission {
  id: number
  url: string
  createdAt: string
  user: {
    id: number
    name: string
    email: string
  }
  challenge: {
    id: number
    title: string
    theme: string
  }
  scores: Array<{
    id: number
    value: number
    comment: string | null
    createdAt: string
  }>
}

export default function ScoreSubmissionPage() {
   const params = useParams<{ challengeId: string; submissionId: string }>()  
  const router = useRouter()
  
  const [score, setScore] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submission, setSubmission] = useState<Submission | null>(null)
 const [maxScore, setMaxScore] = useState(100) // Valeur par défaut
  const [, setIsMiniChallenge] = useState(false)

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await fetch(`/api/submissions/${params.submissionId}`)
        const data = await response.json()
        
        if (response.ok) {
          setSubmission(data.submission)
          // Pré-remplir si déjà noté
           // DÉTERMINER LE SCORE MAX selon le type de challenge
          const isMini = data.submission.challenge.type === 'MiniChallenge'
          setIsMiniChallenge(isMini)
          setMaxScore(isMini ? 10 : 100)
          if (data.submission.scores.length > 0) {
            setScore(data.submission.scores[0].value.toString())
            setComment(data.submission.scores[0].comment || '')
          }
        } else {
          setError(data.error || 'Erreur de chargement')
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setError('Erreur de connexion au serveur')
      } finally {
        setLoading(false)
      }
    }

    if (params.submissionId) {
      fetchSubmission()
    }
  }, [params.submissionId])

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setSubmitting(true)
  setError('')

  try {
    const response = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submissionId: params.submissionId,
        value: parseInt(score),
        comment: comment.trim() || null
      })
    })

    const data = await response.json()

    if (response.ok) {
      router.push(`/jury/challenges/${params.challengeId}?message=Note enregistrée avec succès`)
    } else {
      setError(data.error || 'Erreur lors de la notation')
    }
  } catch (error) {
    console.error('Erreur:', error)
    setError('Erreur de connexion - Vérifie que le serveur fonctionne')
  } finally {
    setSubmitting(false)
  }
}

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de la soumission...</p>
        </div>
      </div>
    )
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
          <p className="text-gray-600 mb-6">{error || 'Soumission non trouvée'}</p>
          <button
            onClick={() => router.back()}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* En-tête */}
        <div className="mb-6">
          <button
            onClick={() => router.push(`/jury/challenges/${params.challengeId}`)}
            className="text-indigo-600 hover:text-indigo-800 inline-flex items-center mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour aux soumissions
          </button>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Noter la soumission</h1>
          <p className="text-gray-600">Challenge: {submission.challenge.title}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {/* Informations du projet */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Projet de {submission.user.name}
            </h2>
            <p className="text-gray-600 mb-2">{submission.user.email}</p>
            <p className="text-sm text-gray-500">
              Soumis le {new Date(submission.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>

          {/* Lien du projet */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lien du projet
            </label>
            <a
              href={submission.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 break-words inline-flex items-center"
            >
              <span className="mr-2">🌐</span>
              {submission.url}
            </a>
          </div>

          {/* Thème du challenge */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thème à respecter
            </label>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-yellow-800 font-medium">{submission.challenge.theme}</p>
            </div>
          </div>
        </div>

        {/* Formulaire de notation */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Évaluation</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Note */}
            <div>
              <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-2">
                Note sur 10 *
              </label>
              <input
    id="score"
    type="number"
    min="0"
    max={maxScore}
    step="1"
    required
    value={score}
    onChange={(e) => setScore(e.target.value)}
    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
    placeholder={`Donnez une note entre 0 et ${maxScore}`}
  />
              <p className="text-sm text-gray-500 mt-1">
                0 = Très faible, {maxScore} = Excellent
              </p>
            </div>

            {/* Commentaire */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire (optionnel)
              </label>
              <textarea
                id="comment"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Commentaires sur le projet, points forts, axes d'amélioration..."
              />
            </div>

            {/* Erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enregistrement...
                  </span>
                ) : submission.scores.length > 0 ? (
                  'Mettre à jour la note'
                ) : (
                  'Enregistrer la note'
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push(`/jury/challenges/${params.challengeId}`)}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}