// src/app/admin/challenges/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Challenge {
  id: number
  title: string
  description?: string
  theme: string
  startDate: string
  endDate: string
  type: 'Challenge' | 'MiniChallenge'
  isActive: boolean
  createdBy: number
}

export default function EditChallengePage() {
  const params = useParams()
  const router = useRouter()
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        setLoading(true)
        setError('')
        
        // Vérification que params.id est défini
        if (!params?.id) {
          throw new Error('Identifiant du challenge manquant')
        }
        
        const challengeId = Array.isArray(params.id) ? params.id[0] : params.id
        const response = await fetch(`/api/challenges/${challengeId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Challenge non trouvé')
          } else if (response.status === 403) {
            throw new Error('Accès non autorisé')
          } else {
            throw new Error(`Erreur ${response.status}`)
          }
        }
        
        const data = await response.json()
        setChallenge(data.challenge || data)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erreur lors du chargement'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchChallenge()
  }, [params])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!challenge) return
    
    setIsSubmitting(true)
    setError('')

    try {
      const challengeId = Array.isArray(params.id) ? params.id[0] : params.id
      const response = await fetch(`/api/challenges/${challengeId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(challenge)
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/admin/challenges?message=Challenge+modifié+avec+succès')
        router.refresh()
      } else {
        setError(data.error || 'Erreur lors de la modification')
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError('Erreur de connexion au serveur')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleChange(field: keyof Challenge, value: unknown) {
        setChallenge(prev => prev ? { ...prev, [field]: value } : null)
    }

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    // Convertit la date locale en ISO string
    const date = new Date(value)
    const isoString = date.toISOString()
    handleChange(field, isoString)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du challenge...</p>
        </div>
      </div>
    )
  }

  if (error && !challenge) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-xl font-semibold text-red-800 mb-2">Erreur</h1>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => router.push('/admin/challenges')}
              className="bg-red-100 text-red-800 px-4 py-2 rounded-md hover:bg-red-200 transition-colors"
            >
              Retour à la liste
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">Challenge non trouvé</h1>
          <button 
            onClick={() => router.push('/admin/challenges')}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  // Fonction pour formater la date pour les inputs datetime-local
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ''
      
      // Format: YYYY-MM-DDTHH:MM
      const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      return localDateTime.toISOString().slice(0, 16)
    } catch {
      return ''
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <button
              onClick={() => router.push('/admin/challenges')}
              className="text-indigo-600 hover:text-indigo-800 inline-flex items-center mb-4 text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour à la liste
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Modifier le Challenge</h1>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre du challenge *
              </label>
              <input
                type="text"
                required
                value={challenge.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Titre du challenge"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                value={challenge.type}
                onChange={(e) => handleChange('type', e.target.value as 'Challenge' | 'MiniChallenge')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="Challenge">Challenge Principal</option>
                <option value="MiniChallenge">Mini-Challenge</option>
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formatDateForInput(challenge.startDate)}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formatDateForInput(challenge.endDate)}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Thème */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thème *
              </label>
              <input
                type="text"
                required
                value={challenge.theme || ''}
                onChange={(e) => handleChange('theme', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Thème du challenge"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={4}
                value={challenge.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Description du challenge..."
              />
            </div>

            {/* Statut */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={challenge.isActive || false}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Challenge actif
              </label>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/challenges')}
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