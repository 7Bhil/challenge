// src/app/ranking/page.tsx - Version corrigée
'use client'

import { useState, useEffect } from 'react'

interface RankingUser {
  userId: number
  userName: string
  userEmail: string
  totalScore: number
  challengesCount: number
  averageScore: number
}

export default function GeneralRankingPage() {
  const [ranking, setRanking] = useState<RankingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        console.log('🔄 Chargement du classement...')
        const response = await fetch('/api/ranking/general')
        const data = await response.json()

        if (response.ok && data.success) {
          console.log('✅ Classement chargé:', data.ranking)
          setRanking(data.ranking)
        } else {
          setError(data.error || 'Erreur lors du chargement du classement')
        }
      } catch (error) {
        console.error('💥 Erreur:', error)
        setError('Erreur de connexion au serveur')
      } finally {
        setLoading(false)
      }
    }

    fetchRanking()
  }, [])

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
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Classement Général</h1>
        <p className="text-gray-600 mb-8">
          Classement basé sur la moyenne des scores de tous les challenges
        </p>

        {ranking.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">Aucune donnée de classement disponible</p>
            <p className="text-gray-400 mt-2">Les challenges n&apos;ont pas encore été notés</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Moyenne
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Challenges
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ranking.map((user, index) => (
                  <tr 
                    key={user.userId} 
                    className={index < 3 ? 'bg-yellow-50' : 'hover:bg-gray-50'}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-yellow-400' : 
                          index === 1 ? 'bg-gray-300' : 
                          index === 2 ? 'bg-orange-400' : 'bg-gray-100'
                        }`}>
                          <span className={`font-bold ${
                            index < 3 ? 'text-white' : 'text-gray-600'
                          }`}>
                            {index + 1}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.userName}</div>
                        <div className="text-sm text-gray-500">{user.userEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-2xl font-bold text-indigo-600">
                        {user.averageScore}
                      </span>
                      <span className="text-sm text-gray-500">/100</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.challengesCount} challenge(s)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.totalScore} points
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}