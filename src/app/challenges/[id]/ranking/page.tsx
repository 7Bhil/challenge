// src/app/challenges/[id]/ranking/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface RankingEntry {
  userId: number
  userName: string
  userEmail: string
  submissionId: number
  submissionUrl: string
  score: number
  position: number
  scoresCount: number
}

interface ChallengeInfo {
  id: number
  title: string
  type: 'Challenge' | 'MiniChallenge'
}

export default function ChallengeRankingPage() {
  const params = useParams<{ id: string | string[] }>() // Typage explicite
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [challenge, setChallenge] = useState<ChallengeInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true)
      setError(null)

      try {
        // Vérifie que params.id existe et est une chaîne
        const challengeId = Array.isArray(params.id) ? params.id[0] : params.id

        if (!challengeId || typeof challengeId !== 'string') {
          throw new Error("ID de challenge manquant ou invalide")
        }

        // Vérifie que l'ID est un nombre valide
        const id = parseInt(challengeId)
        if (isNaN(id)) {
          throw new Error("ID de challenge invalide")
        }

        // Construit l'URL pour l'API
        const url = search
          ? `/api/ranking/challenge/${id}?search=${encodeURIComponent(search)}`
          : `/api/ranking/challenge/${id}`

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${await response.text()}`)
        }

        const data = await response.json()
        setRanking(data.ranking || [])
        setChallenge(data.challenge || null)
      } catch (error) {
        console.error('Erreur lors du chargement du classement:', error)
        setError(error instanceof Error ? error.message : "Erreur inconnue")
      } finally {
        setLoading(false)
      }
    }

    fetchRanking()
  }, [params.id, search])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du classement...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 rounded-full p-3 inline-block mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Erreur</h1>
          <p className="text-gray-600">{error}</p>
          <Link
            href="/dashboard"
            className="mt-4 text-indigo-600 hover:text-indigo-800 inline-flex items-center"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            href={`/challenges/${params.id}`} 
            className="text-indigo-600 hover:text-indigo-800 inline-flex items-center mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour au challenge
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Classement {challenge?.title}
              </h1>
              <p className="text-gray-600">
                Résultats du {challenge?.type === 'MiniChallenge' ? 'mini-challenge' : 'challenge'}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <input
                type="text"
                placeholder="Rechercher un participant..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projet
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ranking.map((entry, index) => (
                  <tr key={entry.submissionId} className={index < 3 ? 'bg-yellow-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-yellow-200' : 
                          index === 1 ? 'bg-gray-200' : 
                          index === 2 ? 'bg-orange-200' : 'bg-gray-100'
                        }`}>
                          <span className={`font-bold ${
                            index === 0 ? 'text-yellow-800' : 
                            index === 1 ? 'text-gray-800' : 
                            index === 2 ? 'text-orange-800' : 'text-gray-800'
                          }`}>
                            {entry.position}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{entry.userName}</div>
                      <div className="text-sm text-gray-500">{entry.userEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{entry.score}/100</div>
                      <div className="text-xs text-gray-500">{entry.scoresCount} notation(s)</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={entry.submissionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 text-sm inline-flex items-center"
                      >
                        Voir le projet
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {ranking.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {search ? 'Aucun participant ne correspond à votre recherche' : 'Aucune soumission pour ce challenge.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}