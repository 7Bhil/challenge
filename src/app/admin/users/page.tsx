// src/app/admin/users/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isAdmin } from '@/lib/roles'
import { useEffect, useState } from 'react'
import { Role } from '@prisma/client'

interface User {
  id: number
  email: string
  name: string
  role: Role
  isActive: boolean
  createdAt: string
}

export default function UsersAdminPage() {
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (session && isAdmin(session.user?.role ?? '')) {
      fetchUsers()
    }
  }, [session])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccessMessage(null)
      
      const response = await fetch('/api/admin/users')
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
      setError(error instanceof Error ? error.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const canModifyUser = (targetUserId: number, targetUserRole: Role): boolean => {
    if (!session?.user) return false
    
    const currentUserId = parseInt(session.user.id)
    const currentUserRole = session.user.role as Role
    
    // Empêcher de se modifier soi-même
    if (currentUserId === targetUserId) {
      return false
    }
    
    // SuperAdmin peut modifier tout le monde (sauf lui-même et les autres SuperAdmin)
    if (currentUserRole === Role.SuperAdmin) {
      return targetUserRole !== Role.SuperAdmin
    }
    
    // Admin peut seulement modifier les Challengers
    if (currentUserRole === Role.Admin) {
      return targetUserRole === Role.Challenger
    }
    
    return false
  }

  const getAvailableRoles = (currentUserRole: string, role: string, currentRole: Role): Role[] => {
    // SuperAdmin peut promouvoir vers Admin, Judge ou Challenger
    if (currentRole === Role.SuperAdmin) {
      return [Role.Challenger, Role.Judge, Role.Admin]
    }
    
    // Admin peut seulement promouvoir Challenger → Judge
    if (currentRole === Role.Admin) {
      return [Role.Judge]
    }
    
    return []
  }

  // Fonction pour mettre à jour le rôle d'un utilisateur
const updateUserRole = async (userId: number, newRole: Role, userEmail: string) => {
  try {
    setUpdatingUserId(userId)
    setError(null)
    setSuccessMessage(null)

    const response = await fetch('/api/admin/users/role', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, role: newRole }),
    })

    // Parsez la réponse JSON d'abord
    const data = await response.json()

    // Ensuite vérifiez si la réponse est OK
    if (!response.ok) {
      throw new Error(data.error || `Erreur ${response.status}: ${response.statusText}`)
    }

    setSuccessMessage(data.message || `Rôle de ${userEmail} mis à jour avec succès`)
    
    // Recharger la liste des utilisateurs
    await fetchUsers()
    
    return data
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue lors de la mise à jour du rôle'
    setError(errorMessage)
    throw error
  } finally {
    setUpdatingUserId(null)
  }
}

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

if (!session || !isAdmin(session.user?.role ?? '')) {
    redirect('/dashboard')
  }

  const currentUserRole = session.user.role as Role

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestion des Utilisateurs</h1>
            <p className="text-gray-600 mt-2">
              Gérer les rôles et permissions des utilisateurs
            </p>
          </div>
          <Link 
            href="/admin" 
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm hover:bg-gray-300 transition-colors"
          >
            ← Retour au dashboard
          </Link>
        </div>
        
        {/* Messages d'alerte */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex justify-between items-start">
              <span>Erreur: {error}</span>
              <button 
                onClick={() => setError(null)}
                className="text-red-800 hover:text-red-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <div className="flex justify-between items-start">
              <span>{successMessage}</span>
              <button 
                onClick={() => setSuccessMessage(null)}
                className="text-green-800 hover:text-green-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rôle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date d&apos;inscription
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => {
                      const canModify = canModifyUser(user.id, user.role)
                      const availableRoles = getAvailableRoles(currentUserRole, user.role, currentUserRole)
                      return (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-indigo-800 font-medium">
                                  {user.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name || 'Utilisateur sans nom'}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === Role.SuperAdmin ? 'bg-purple-100 text-purple-800' :
                              user.role === Role.Admin ? 'bg-blue-100 text-blue-800' :
                              user.role === Role.Judge ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <select
                                value={user.role}
                                onChange={(e) => updateUserRole(user.id, e.target.value as Role, user.email)}
                                disabled={updatingUserId === user.id || !canModify || availableRoles.length === 0}
                                className="border border-gray-300 rounded-md px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              >
                                <option value={user.role}>
                                  {user.role} (actuel)
                                </option>
                                {availableRoles
                                  .filter(role => role !== user.role)
                                  .map((role) => (
                                    <option key={role} value={role}>
                                      {role}
                                    </option>
                                  ))
                                }
                              </select>
                              
                              {updatingUserId === user.id && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                              )}
                              
                              {!canModify && user.id !== parseInt(session.user.id) && (
                                <span className="text-xs text-gray-500">Non modifiable</span>
                              )}
                              
                              {user.id === parseInt(session.user.id) && (
                                <span className="text-xs text-gray-500">Vous</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {users.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">Aucun utilisateur trouvé</p>
                <p className="text-gray-400 text-sm mt-2">Les utilisateurs apparaîtront ici une fois inscrits</p>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Légende des permissions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Super Admin peut :</p>
                  <ul className="text-gray-600 list-disc list-inside mt-2">
                    <li>Promouvoir vers Admin, Juré ou Challenger</li>
                    <li>Modifier tous les utilisateurs (sauf lui-même)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Admin peut :</p>
                  <ul className="text-gray-600 list-disc list-inside mt-2">
                    <li>Promouvoir Challenger → Juré</li>
                    <li>Modifier seulement les Challengers</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}