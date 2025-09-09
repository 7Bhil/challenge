// src/app/challenges/[id]/submit/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'

interface Challenge {
  id: number
  title: string
  isActive: boolean
  startDate: Date
  endDate: Date
}

export default function SubmissionForm() {
  const [formData, setFormData] = useState({
    url: '',
    challengeId: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(true)

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
        }
      } catch (error) {
        console.error('Erreur chargement challenges:', error)
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
      // Validation
      if (!session?.user?.id) {
        throw new Error('Vous devez être connecté pour soumettre un projet')
      }

      if (!formData.url.trim() || !formData.challengeId.trim()) {
        throw new Error('URL et challenge sont requis')
      }

      // Validation URL
      try {
        new URL(formData.url)
      } catch {
        throw new Error('URL invalide')
      }

      console.log('Envoi des données:', {
        url: formData.url,
        challengeId: formData.challengeId
      })

      // Appel API
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: formData.url,
          challengeId: formData.challengeId
        })
      })

      const result = await response.json()

      console.log('Réponse API:', response.status, result)

      if (!response.ok) {
        throw new Error(result.error || `Erreur ${response.status}`)
      }

      // Redirection après succès
      router.push(`/challenges/${formData.challengeId}?message=Votre projet a été soumis avec succès`)
      router.refresh()

    } catch (error) {
      console.error('Erreur soumission:', error)
      setError(error instanceof Error ? error.message : 'Erreur de soumission')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingChallenges) {
    return <div>Chargement des challenges...</div>
  }

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Soumettre un Projet</h1>
      
      {error && (
        <div style={{ 
          color: 'red', 
          padding: '1rem', 
          marginBottom: '1rem', 
          border: '1px solid red',
          borderRadius: '4px',
          backgroundColor: '#ffe6e6'
        }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            URL du projet *
          </label>
          <input
            type="url"
            placeholder="https://github.com/ton-user/ton-projet"
            value={formData.url}
            onChange={(e) => setFormData({...formData, url: e.target.value})}
            required
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Sélectionner un challenge *
          </label>
          <select
            value={formData.challengeId}
            onChange={(e) => setFormData({...formData, challengeId: e.target.value})}
            required
            disabled={isSubmitting || challenges.length === 0}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '1rem',
              backgroundColor: challenges.length === 0 ? '#f5f5f5' : 'white'
            }}
          >
            <option value="">{challenges.length === 0 ? 'Aucun challenge disponible' : 'Choisissez un challenge...'}</option>
            {challenges.map((challenge) => (
              <option key={challenge.id} value={challenge.id}>
                {challenge.title} (du {new Date(challenge.startDate).toLocaleDateString()} au {new Date(challenge.endDate).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting || challenges.length === 0}
          style={{
            padding: '1rem 2rem',
            backgroundColor: isSubmitting || challenges.length === 0 ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isSubmitting || challenges.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            transition: 'background-color 0.2s'
          }}
        >
          {isSubmitting ? '⏳ Envoi en cours...' : '🚀 Soumettre le projet'}
        </button>
      </form>

      {/* Debug info */}
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '6px', fontSize: '0.9rem' }}>
        <strong>Info debug:</strong>
        <div>URL: {formData.url || 'non renseignée'}</div>
        <div>Challenge ID: {formData.challengeId || 'non sélectionné'}</div>
        <div>Challenges chargés: {challenges.length}</div>
      </div>
    </div>
  )
}