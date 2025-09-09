// src/app/admin/challenges/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/roles'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import DeleteChallengeButton from '@/components/DeleteChallengeButton'

export default async function AdminChallengesPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const session = await getServerSession(authOptions)

if (!session || !isAdmin(session.user?.role ?? '')) {
    redirect('/auth/error?error=AccessDenied')
  }

  // Récupérer tous les challenges
  const challenges = await prisma.challenge.findMany({
    include: {
      creator: {
        select: { name: true }
      },
      _count: {
        select: { submissions: true }
      }
    },
    orderBy: { createdBy: 'desc' } // Correction: 'createdAt' au lieu de 'createdBy'
  })

  // Attend les searchParams
  const resolvedSearchParams = await searchParams
  const message = resolvedSearchParams.message

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestion des Challenges</h1>
            <p className="text-gray-600 mt-2">
              Créez et gérez les challenges et mini-challenges
            </p>
          </div>
          <Link
            href="/admin/challenges/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 inline-flex items-center justify-center whitespace-nowrap"
          >
            + Nouveau Challenge
          </Link>
        </div>

        {/* Message de succès */}
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {decodeURIComponent(message)}
          </div>
        )}

        {/* Liste des challenges */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Challenge
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Soumissions
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {challenges.map((challenge) => (
                  <tr key={challenge.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {challenge.title}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {challenge.description || 'Aucune description'}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Créé par {challenge.creator.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        challenge.type === 'Challenge' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {challenge.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      <div>Début: {new Date(challenge.startDate).toLocaleDateString('fr-FR')}</div>
                      <div>Fin: {new Date(challenge.endDate).toLocaleDateString('fr-FR')}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {challenge._count.submissions} soumission(s)
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        challenge.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {challenge.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium space-y-2">
                      <div>
                        <Link
                          href={`/admin/challenges/${challenge.id}`}
                          className="text-indigo-600 hover:text-indigo-900 block mb-2"
                        >
                          Modifier
                        </Link>
                      </div>
                      <DeleteChallengeButton challengeId={challenge.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {challenges.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md mt-6">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">Aucun challenge créé</p>
            <p className="text-gray-400 text-sm mt-2">
              Commencez par créer votre premier challenge
            </p>
            <Link
              href="/admin/challenges/new"
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 inline-block"
            >
              Créer un challenge
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}