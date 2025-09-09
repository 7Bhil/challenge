// src/app/admin/challenges/new/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChallengeType } from '@prisma/client'
export default function NewChallengePage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    type: 'Challenge' as ChallengeType
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  
  try {
    const response = await fetch('/api/challenges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    
    if (response.ok) {
      const result = await response.json()
      alert(result.message || 'Challenge créé avec succès')
      router.push('/admin/challenges?message=' + encodeURIComponent('Challenge créé avec succès'))
    } else {
      const error = await response.json()
      alert(error.error || 'Erreur lors de la création')
    }
  } catch (error) {
    alert('Erreur de connexion')
    console.error('Erreur:', error)
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Créer un nouveau Challenge
          </h1>
          <p className="text-gray-600">
            Configurez les détails de votre challenge
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white text-black rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Informations du Challenge
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Title Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Titre du challenge *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 placeholder-gray-400"
                placeholder="Entrez le titre du challenge"
              />
            </div>

            {/* Type Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Type de challenge
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as ChallengeType})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
              >
                <option value="Challenge">🏆 Challenge Principal</option>
                <option value="MiniChallenge">⚡ Mini-Challenge</option>
              </select>
            </div>

            {/* Date Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Date de début *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Date de fin *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 placeholder-gray-400 resize-none"
                placeholder="Décrivez les détails et objectifs du challenge..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200"
              >
                Annuler
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Création en cours...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    Créer le Challenge
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Assurez-vous que toutes les informations sont correctes avant de créer le challenge</p>
        </div>
      </div>
    </div>
  )
}