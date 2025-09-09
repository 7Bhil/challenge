'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { FiCheckCircle, FiAlertCircle, FiLoader, FiGitCommit, FiCalendar, FiLink } from 'react-icons/fi'

interface Challenge {
  id: number
  title: string
  isActive: boolean
  startDate: Date
  endDate: Date
}

export default function SubmissionForm() {
  const [formData, setFormData] = useState({ url: '', challengeId: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(true)
  const [apiError, setApiError] = useState('')
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const challengeIdFromUrl = params.id as string

  // Charger les challenges actifs
  useEffect(() => {
    const loadChallenges = async () => {
      try {
        const response = await fetch('/api/challenges?active=true')
        if (response.ok) {
          const data = await response.json()
          setChallenges(data.challenges || [])
          setApiError('')
        } else {
          setApiError('Erreur lors du chargement des challenges')
        }
      } catch {
        setApiError('Impossible de charger les challenges')
      } finally {
        setIsLoadingChallenges(false)
      }
    }
    loadChallenges()
  }, [])

  // Pré-remplir le challenge si ID dans l'URL
  useEffect(() => {
    if (challengeIdFromUrl && challenges.length > 0) {
      const challengeExists = challenges.find(c => c.id === parseInt(challengeIdFromUrl))
      if (challengeExists) {
        setFormData(prev => ({ ...prev, challengeId: challengeIdFromUrl }))
      }
    }
  }, [challengeIdFromUrl, challenges])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      if (!session?.user?.id) {
        throw new Error('Vous devez être connecté pour soumettre un projet')
      }
      if (!formData.url.trim() || !formData.challengeId.trim()) {
        throw new Error('URL et challenge sont requis')
      }
      try {
        new URL(formData.url)
      } catch {
        throw new Error('URL invalide')
      }
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || `Erreur ${response.status}`)
      }
      router.push(result.redirect || '/dashboard?message=Votre projet a été soumis avec succès')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur de soumission')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingChallenges) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <FiLoader className="animate-spin mx-auto text-indigo-600 text-3xl" />
          <p className="text-gray-600 font-medium">Chargement des challenges...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br text-black from-indigo-50 to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
                <FiGitCommit className="text-indigo-600" /> Soumettre un Projet
              </h1>
              <p className="mt-2 text-gray-600">
                Partagez votre travail et participez aux challenges en cours.
              </p>
            </div>

            {/* Messages */}
            {apiError && (
              <div className="rounded-md bg-yellow-50 p-4 mb-6 border-l-4 border-yellow-400">
                <div className="flex items-start gap-3">
                  <FiAlertCircle className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Attention</h3>
                    <p className="mt-1 text-sm text-yellow-700">{apiError}</p>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="rounded-md bg-red-50 p-4 mb-6 border-l-4 border-red-400">
                <div className="flex items-start gap-3">
                  <FiAlertCircle className="text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="url" className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <FiLink className="text-gray-500" /> URL du projet <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      id="url"
                      type="url"
                      placeholder="https://github.com/votre-utilisateur/votre-projet"
                      value={formData.url}
                      onChange={(e) => setFormData({...formData, url: e.target.value})}
                      required
                      disabled={isSubmitting}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Exemple : <code className="bg-gray-100 px-1 rounded">https://github.com/...</code>
                  </p>
                </div>

                <div>
                  <label htmlFor="challenge" className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <FiCalendar className="text-gray-500" /> Challenge <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="challenge"
                    value={formData.challengeId}
                    onChange={(e) => setFormData({...formData, challengeId: e.target.value})}
                    required
                    disabled={isSubmitting || challenges.length === 0}
                    className="block w-full px-4 py-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Choisissez un challenge...</option>
                    {challenges.map((challenge) => (
                      <option key={challenge.id} value={challenge.id}>
                        {challenge.title} ({new Date(challenge.startDate).toLocaleDateString('fr-FR')} → {new Date(challenge.endDate).toLocaleDateString('fr-FR')})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    {challenges.length} challenge(s) disponible(s)
                  </p>
                </div>
              </div>

              {/* Bouton de soumission */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || challenges.length === 0}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSubmitting || challenges.length === 0 ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors`}
                >
                  {isSubmitting ? (
                    <>
                      <FiLoader className="animate-spin" />
                      Soumission en cours...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle />
                      Soumettre le projet
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Section d'aide */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-1 mb-3">
                <FiAlertCircle className="text-gray-500" /> Besoin d&apos;aide ?
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  Assurez-vous que votre projet est hébergé sur une plateforme publique (GitHub, GitLab, etc.) et que l&apos;URL est accessible.
                </p>
                <p>
                  Si vous ne voyez pas votre challenge, vérifiez qu&apos;il est <strong>actif</strong> et que vous êtes bien inscrit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
