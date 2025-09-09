// src/app/jury/challenges/[challengeId]/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isJuror } from '@/lib/roles'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

interface PageProps {
  params: Promise<{ challengeId: string }>
}

export default async function JuryChallengeDetail({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  
  // DÉBOGAGE : Attendre les params et vérifier
  const resolvedParams = await params
  console.log('Params reçus:', resolvedParams)
  
  const { challengeId } = resolvedParams

  if (!session || !isJuror(session.user?.role ?? '')) {
    redirect('/dashboard?error=AccessDenied')
  }

  // VALIDATION de l'ID
  if (!challengeId) {
    console.error('Challenge ID manquant')
    redirect('/jury?error=ChallengeIdMissing')
  }

  const challengeIdNumber = parseInt(challengeId)
  if (isNaN(challengeIdNumber)) {
    console.error('Challenge ID invalide:', challengeId)
    redirect('/jury?error=ChallengeInvalid')
  }

  console.log('Recherche du challenge ID:', challengeIdNumber)

  try {
    // REQUÊTE CORRIGÉE
    const challenge = await prisma.challenge.findUnique({
      where: { 
        id: challengeIdNumber 
      },
      include: {
        submissions: {
          include: {
            user: { 
              select: { 
                name: true, 
                email: true 
              }
            },
            scores: {
              where: { 
                judgeId: parseInt(session.user?.id || '0') 
              },
              select: { 
                id: true, 
                value: true 
              }
            },
            _count: {
              select: { 
                scores: true 
              }
            }
          },
          orderBy: { 
            createdAt: 'desc' 
          }
        }
      }
    })

    if (!challenge) {
      console.error('Challenge non trouvé ID:', challengeIdNumber)
      redirect('/jury?error=ChallengeNotFound')
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/jury" className="text-indigo-600 hover:text-indigo-800">
              ← Retour au dashboard jury
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 mt-4">{challenge.title}</h1>
            <p className="text-gray-600">{challenge.submissions.length} soumission(s)</p>
          </div>

          <div className="grid gap-4">
            {challenge.submissions.map((submission) => (
              <div key={submission.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Projet de {submission.user.name}
                    </h3>
                    <p className="text-sm text-gray-500">{submission.user.email}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Soumis le {new Date(submission.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      submission.scores.length > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {submission.scores.length > 0 ? 'Déjà noté' : 'À noter'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {submission._count.scores} notation(s) au total
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <a
                    href={submission.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 text-sm inline-flex items-center"
                  >
                    🔗 Voir le projet
                  </a>
                </div>

                {submission.scores.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                    <p className="text-sm text-blue-800">
                      Votre note: <strong>{submission.scores[0].value}/10</strong>
                    </p>
                  </div>
                )}

                <Link
                  href={`/jury/challenges/${challenge.id}/submissions/${submission.id}`}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm"
                >
                  {submission.scores.length > 0 ? 'Modifier la note' : 'Noter ce projet'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    )

  } catch (error) {
    console.error('Erreur lors de la récupération du challenge:', error)
    redirect('/jury?error=ServerError')
  }
}