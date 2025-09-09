// src/app/challenges/[id]/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { isAdmin, isJuror } from '@/lib/roles'
import CountdownTimer from '@/components/CountdownTimer'

export default async function ChallengeDetail({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const id = parseInt(params.id)
  if (isNaN(id)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">ID de challenge invalide</h1>
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    )
  }

  // Récupère le challenge
  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      creator: { select: { name: true } },
      submissions: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
      },
      _count: { select: { submissions: true } }
    }
  })

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Challenge non trouvé</h1>
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    )
  }

  // Vérifier si l'utilisateur a déjà soumis pour ce challenge
  const userSubmission = session.user?.id
    ? await prisma.submission.findFirst({
        where: {
          userId: parseInt(session.user.id),
          challengeId: challenge.id
        }
      })
    : null

  const isChallengeStarted = new Date() >= new Date(challenge.startDate)
  const isChallengeOver = new Date() > new Date(challenge.endDate)
  const canSubmit = isChallengeStarted && !isChallengeOver

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête avec navigation */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-indigo-600 hover:text-indigo-800 inline-flex items-center mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour au tableau de bord
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                challenge.type === 'Challenge'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {challenge.type}
              </span>
              <h1 className="text-3xl font-bold text-gray-800 mt-2">
                {challenge.title}
              </h1>
              <p className="text-gray-600 mt-1">
                Créé par {challenge.creator.name}
              </p>
            </div>

            {isAdmin(session.user?.role ?? '') && (
              <Link
                href={`/admin/challenges/edit/${challenge.id}`}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700"
              >
                Modifier le challenge
              </Link>
            )}
          </div>
        </div>

        {/* Compte à rebours ou statut */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {!isChallengeStarted ? (
            <div className="text-center">
              <CountdownTimer
                targetDate={new Date(challenge.startDate)}
                label="Début dans"
              />
              <p className="text-gray-600 mt-2">
                Le challenge commencera le {new Date(challenge.startDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
          ) : isChallengeOver ? (
            <div className="text-center">
              <div className="bg-red-100 text-red-800 px-4 py-3 rounded-md mb-4">
                <p className="font-medium">Challenge terminé</p>
                <p>Le challenge s&apos;est terminé le {new Date(challenge.endDate).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <CountdownTimer
                targetDate={new Date(challenge.endDate)}
                label="Fin dans"
              />
              <p className="text-gray-600 mt-2">
                Vous avez jusqu&apos;au {new Date(challenge.endDate).toLocaleDateString('fr-FR')} pour soumettre votre projet
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2">
            {/* Description et thème */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Description du challenge</h2>
              <p className="text-gray-600 mb-6">{challenge.description}</p>

              {isChallengeStarted ? (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Thème à respecter</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <p className="text-yellow-800 font-medium">{challenge.theme}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <p className="text-gray-600">Le thème sera révélé au début du challenge.</p>
                </div>
              )}
            </div>

            {/* Instructions et règles */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Règles et instructions</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Le projet doit être développé spécifiquement pour ce challenge</li>
                <li>Le code source doit être original (pas de copie)</li>
                <li>Le site doit être responsive et fonctionnel</li>
                <li>Respectez le thème imposé</li>
                <li>La soumission doit inclure un lien vers le site déployé</li>
                {challenge.type === "MiniChallenge" && (
                  <li>Les mini-challenges ont des exigences techniques spécifiques</li>
                )}
              </ul>
            </div>
          </div>

          {/* Colonne latérale */}
          <div>
            {/* Actions */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Actions</h2>

              {userSubmission ? (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                  <p className="text-green-800 font-medium">✅ Vous avez déjà soumis votre projet</p>
                  <p className="text-green-700 text-sm mt-1">
                    Soumis le {new Date(userSubmission.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                  <Link
                    href={`/challenges/${challenge.id}/submit`}
                    className="text-indigo-600 hover:text-indigo-800 text-sm mt-2 inline-block"
                  >
                    Modifier ma soumission
                  </Link>
                </div>
              ) : canSubmit ? (
                <Link
                  href={`/challenges/${challenge.id}/submit`}
                  className="w-full bg-indigo-600 text-white px-4 py-3 rounded-md text-center block hover:bg-indigo-700 mb-4"
                >
                  Soumettre un projet
                </Link>
              ) : !isChallengeStarted ? (
                <div className="bg-gray-100 text-gray-600 px-4 py-3 rounded-md text-center mb-4">
                  ⏳ Les soumissions ne sont pas encore ouvertes
                </div>
              ) : isChallengeOver ? (
                <div className="bg-red-100 text-red-800 px-4 py-3 rounded-md text-center mb-4">
                  🏁 Les soumissions sont closes
                </div>
              ) : null}

              {isJuror(session.user?.role) && isChallengeOver && (
                <Link
                  href={`/jury/challenges/${challenge.id}`}
                  className="w-full bg-purple-600 text-white px-4 py-3 rounded-md text-center block hover:bg-purple-700"
                >
                  Noter les soumissions
                </Link>
              )}
            </div>

            {/* Informations du challenge */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Informations</h2>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Date de début</p>
                  <p className="font-medium">{new Date(challenge.startDate).toLocaleDateString('fr-FR')}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Date de fin</p>
                  <p className="font-medium">{new Date(challenge.endDate).toLocaleDateString('fr-FR')}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Participants</p>
                  <p className="font-medium">{challenge._count.submissions}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">{challenge.type}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section des soumissions (visible seulement après la fin du challenge) */}
        {isChallengeOver && challenge.submissions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Projets soumis</h2>

            <div className="grid gap-4 md:grid-cols-2">
              {challenge.submissions.map((submission) => (
                <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800">{submission.user.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Soumis le {new Date(submission.createdAt).toLocaleDateString('fr-FR')}
                  </p>

                  <a
                    href={submission.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 text-sm inline-flex items-center"
                  >
                    Voir le projet
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
