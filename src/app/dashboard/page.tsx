// src/app/dashboard/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { isAdmin, isJuror } from '@/lib/roles'
import CountdownTimer from '@/components/CountdownTimer'

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string // if you use roles
    }
  }
}
export default async function Dashboard() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  // Récupérer les challenges actifs (non terminés)
  const activeChallenges = await prisma.challenge.findMany({
    where: { 
      isActive: true,
      endDate: { gte: new Date() } // Seulement ceux pas encore terminés
    },
    include: {
      _count: {
        select: { submissions: true }
      },
      creator: {
        select: { name: true }
      }
    },
    orderBy: { startDate: 'asc' }
  })

  // Récupérer les soumissions de l'utilisateur connecté
 const userSubmissions = session.user?.id
  ? await prisma.submission.findMany({
      where: { userId: parseInt(session.user.id) },
      include: {
        challenge: {
          select: { title: true, type: true, id: true }
        }
      }
    })
  : []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Tableau de Bord</h1>
          <p className="text-gray-600 mt-2">
            Bienvenue, {session.user?.name} ! Voici l&apos;état des challenges en cours.
          </p>
        </div>

        {/* Section Challenges Actifs */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Challenges en Cours</h2>
            {isAdmin(session.user?.role ?? '') && (
              <Link
                href="/admin/challenges"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700"
              >
                Gérer les challenges
              </Link>
            )}
{isJuror(session.user?.role) && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
    <h3 className="text-lg font-semibold text-blue-800 mb-2">Espace Jury</h3>
    <p className="text-blue-600 mb-4">
      Vous avez accès à l&apos;espace jury pour noter les soumissions.
    </p>
    <Link href="/jury" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
      Accéder à l&apos;espace jury
    </Link>
  </div>
)}
          </div>

          {activeChallenges.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun challenge en cours</h3>
              <p className="text-gray-500">Revenez plus tard pour découvrir les prochains défis !</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {activeChallenges.map((challenge) => {
                const hasSubmitted = userSubmissions.some(sub => sub.challengeId === challenge.id)
                const isChallengeStarted = new Date() >= new Date(challenge.startDate)
                const isChallengeOver = new Date() > new Date(challenge.endDate)
                
                return (
                  <div key={challenge.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                    <div className="p-6">
                      {/* En-tête du challenge */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            challenge.type === 'Challenge' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {challenge.type}
                          </span>
                          <h3 className="text-xl font-semibold text-gray-800 mt-2">
                            {challenge.title}
                          </h3>
                        </div>
                      </div>

                      {/* Compte à rebours ou statut */}
                      {!isChallengeStarted ? (
                        <div className="mb-4">
                          <CountdownTimer 
                            targetDate={new Date(challenge.startDate)} 
                            label="Début dans" 
                          />
                        </div>
                      ) : isChallengeOver ? (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                          <p className="text-red-700 text-sm">Challenge terminé</p>
                        </div>
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                          <CountdownTimer 
                            targetDate={new Date(challenge.endDate)} 
                            label="Fin dans" 
                          />
                        </div>
                      )}

                      {/* Description conditionnelle */}
                      {isChallengeStarted ? (
                        <>
                          <p className="text-gray-600 mb-4">{challenge.description}</p>
                          
                          {/* Thème révélé */}
                          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                            <h4 className="text-sm font-medium text-yellow-800 mb-1">Thème :</h4>
                            <p className="text-yellow-700">{challenge.theme}</p>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-3 mb-4">
                          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                            <h4 className="text-sm font-medium text-gray-800 mb-1">Description</h4>
                            <p className="text-gray-600">Révélée à l&apos; ouverture du challenge</p>
                          </div>
                          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                            <h4 className="text-sm font-medium text-gray-800 mb-1">Thème</h4>
                            <p className="text-gray-600">Secret jusqu&apos; au début du challenge</p>
                          </div>
                        </div>
                      )}

                      {/* Statistiques et dates */}
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="font-medium text-gray-700">{challenge._count.submissions}</span>
                          <p className="text-gray-500">soumissions</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            {new Date(challenge.endDate).toLocaleDateString('fr-FR')}
                          </span>
                          <p className="text-gray-500">date de fin</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-3">
                        {hasSubmitted ? (
                          <span className="bg-green-100 text-green-800 px-3 py-2 rounded-md text-sm">
                            ✅ Déjà soumis
                          </span>
                        ) : isChallengeStarted && !isChallengeOver ? (
                          <Link
                            href={`/challenges/${challenge.id}/submit`}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700"
                          >
                            Soumettre un projet
                          </Link>
                        ) : !isChallengeStarted ? (
                          <span className="bg-gray-100 text-gray-600 px-3 py-2 rounded-md text-sm">
                            ⏳ Bientôt disponible
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm">
                            🏁 Terminé
                          </span>
                        )}
                        
                        <Link
                          href={`/challenges/${challenge.id}`}
                          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50"
                        >
                          Voir détails
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Mes Soumissions */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Mes Soumissions</h2>
          
          {userSubmissions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500">Vous n&apos;avez pas encore soumis de projet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Challenge
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date de soumission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      État
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userSubmissions.map((submission) => (
                    <tr key={submission.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {submission.challenge.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          submission.challenge.type === 'Challenge' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {submission.challenge.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(submission.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-semibold rounded-full">
                          En attente de notation
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Statistiques personnelles */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Mes Statistiques</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{userSubmissions.length}</div>
              <div className="text-sm text-blue-800">Soumissions</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-green-800">Challenges complétés</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {userSubmissions.length}
              </div>
              <div className="text-sm text-yellow-800">En attente</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-purple-800">Moyenne</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}