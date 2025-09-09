// src/app/admin/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/roles'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

// Cette fonction est async car elle utilise getServerSession
export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  
  // Vérification côté serveur
if (!session || !isAdmin(session.user?.role ?? '')) {
    redirect('/auth/error?error=AccessDenied&message=Vous+n\'avez+plus+les+permissions+d\'administrateur')
  }

  // Récupérer les statistiques côté serveur
  let stats = null;
  let error = null;

  try {
    const [userCount, challengeCount, submissionCount, judgeCount] = await Promise.all([
      prisma.user.count(),
      prisma.challenge.count(),
      prisma.submission.count(),
      prisma.user.count({ where: { role: 'Judge' } })
    ]);

    stats = { userCount, challengeCount, submissionCount, judgeCount };
  } catch (e) {
    console.error('Error fetching stats:', e);
    error = 'Erreur lors du chargement des statistiques';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Tableau de bord d&apos; Administration</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Erreur: {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/users" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-4 text-indigo-600">Gestion des Utilisateurs</h2>
            <p className="text-gray-600">Gérer les rôles et permissions des utilisateurs</p>
          </Link>

          <Link href="/admin/challenges" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-4 text-indigo-600">Gestion des Challenges</h2>
            <p className="text-gray-600">Créer et modifier les challenges</p>
          </Link>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Statistiques</h2>
          {stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-indigo-50 rounded">
                <p className="text-2xl font-bold text-indigo-600">{stats.userCount}</p>
                <p className="text-sm text-gray-600">Utilisateurs</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded">
                <p className="text-2xl font-bold text-green-600">{stats.challengeCount}</p>
                <p className="text-sm text-gray-600">Challenges</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded">
                <p className="text-2xl font-bold text-yellow-600">{stats.submissionCount}</p>
                <p className="text-sm text-gray-600">Soumissions</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded">
                <p className="text-2xl font-bold text-purple-600">{stats.judgeCount}</p>
                <p className="text-sm text-gray-600">Jurés</p>
              </div>
            </div>
          ) : error ? null : (
            <p className="text-gray-600">Chargement des données...</p>
          )}
        </div>

        {/* Section informations utilisateur */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Informations de session</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">Utilisateur connecté:</p>
              <p className="text-gray-600">{session.user?.name} ({session.user?.email})</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Rôle:</p>
              <p className="text-gray-600 capitalize">{session.user?.role?.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}