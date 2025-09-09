// src/app/jury/challenges/[challengeId]/ranking/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface RankingStats {
  submissionId: number
  userId: number
  userName: string
  userEmail: string
  projectUrl: string
  scores: Array<{ value: number; judgeName: string }>
  totalScore: number
  averageScore: number
  scoresCount: number
  missingScores: number
}

export default function ChallengeRankingPage() {
  const params = useParams()
  const [stats, setStats] = useState<RankingStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/challenges/${params.challengeId}/stats`)
        const data = await response.json()
        
        if (response.ok) {
          setStats(data.stats)
        } else {
          setError(data.error)
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setError('Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [params.challengeId])

  if (loading) return <div>Chargement du classement...</div>
  if (error) return <div>Erreur: {error}</div>

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Classement du Challenge</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">#</th>
                <th className="px-6 py-3 text-left">Participant</th>
                <th className="px-6 py-3 text-left">Moyenne</th>
                <th className="px-6 py-3 text-left">Total</th>
                <th className="px-6 py-3 text-left">Notes</th>
                <th className="px-6 py-3 text-left">Projet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.map((stat, index) => (
                <tr key={stat.submissionId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{stat.userName}</div>
                      <div className="text-sm text-gray-500">{stat.userEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-2xl font-bold text-indigo-600">
                      {stat.averageScore}
                    </span>
                    <span className="text-sm text-gray-500">/100</span>
                  </td>
                  <td className="px-6 py-4">
                    {stat.totalScore} points
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {stat.scores.map((score, i) => (
                        <div key={i}>
                          {score.judgeName}: <strong>{score.value}</strong>
                        </div>
                      ))}
                      {stat.missingScores > 0 && (
                        <div className="text-orange-500">
                          {stat.missingScores} note(s) manquante(s)
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={stat.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      Voir le projet
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}