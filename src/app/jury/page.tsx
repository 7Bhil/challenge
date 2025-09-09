import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isJuror } from '@/lib/roles'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function JuryDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || !isJuror(session.user?.role ?? '')) {
    redirect('/dashboard?error=AccessDenied')
  }

  // Récupérer les challenges terminés avec des soumissions
  const challenges = await prisma.challenge.findMany({
    where: {
      endDate: { lt: new Date() },
      submissions: { some: {} }
    },
    include: {
      submissions: {
        include: {
          scores: {
            where: {
              judgeId: parseInt(session.user?.id || '0')
            }
          }
        }
      }
    },
    orderBy: { endDate: 'desc' }
  })

  // Calculer les counts manuellement
  const challengesWithCounts = challenges.map(challenge => ({
    id: challenge.id,
    title: challenge.title,
    endDate: challenge.endDate,
    totalSubmissions: challenge.submissions.length,
    userScoresCount: challenge.submissions.reduce((count, submission) => 
      count + submission.scores.length, 0
    )
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Espace Jury</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {challengesWithCounts.map((challenge) => (
            <div key={challenge.id} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {challenge.title}
              </h2>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>📅 Terminé le {new Date(challenge.endDate).toLocaleDateString('fr-FR')}</p>
                <p>🚀 {challenge.totalSubmissions} soumission(s)</p>
                <p>⭐ {challenge.userScoresCount} déjà noté(s) par vous</p>
              </div>

              <Link
                href={`/jury/challenges/${challenge.id}`}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 block text-center"
              >
                Noter les soumissions
              </Link>
            </div>
          ))}
        </div>

        {challengesWithCounts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">Aucun challenge à noter pour le moment</p>
          </div>
        )}
      </div>
    </div>
  )
}