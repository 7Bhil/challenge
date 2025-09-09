// src/app/profile/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useState } from 'react'

export default function Profile() {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(session?.user?.name || '')
  const [email, setEmail] = useState(session?.user?.email || '')

  if (!session) {
    redirect('/login')
  }

  const handleSave = async () => {
    // Ici, vous ajouterez la logique pour sauvegarder les modifications
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">Mon profil</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="mt-1 text-lg">{session.user?.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="mt-1 text-lg">{session.user?.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Rôle</label>
              <p className="mt-1 text-lg capitalize">{session.user?.role?.toLowerCase()}</p>
            </div>

            <div className="flex space-x-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md"
                  >
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
                  >
                    Annuler
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md"
                >
                  Modifier le profil
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}