// src/app/page.tsx
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function Home() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      

      <main className="container mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Améliorez vos compétences grâce à des défis de développement
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Participez à des challenges stimulants, soumettez vos créations et montez dans le classement.
          </p>
          {!user && (
            <Link href="/register" className="bg-indigo-600 text-white px-6 py-3 rounded-md text-lg font-medium">
              Commencer maintenant
            </Link>
          )}
        </section>

        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Challenges Réguliers</h3>
            <p className="text-gray-600">
              Participez à des challenges thématiques avec notation sur 100 points par un jury d&apos;experts.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Mini-Challenges</h3>
            <p className="text-gray-600">
              Des défis plus courts et plus fréquents pour vous entraîner au quotidien (notation sur 10).
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Classements</h3>
            <p className="text-gray-600">
              Comparez vos performances avec les autres participants et montez dans le classement général.
            </p>
          </div>
        </section>

        <section className="bg-white p-8 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-6 text-center">Fonctionnalités à venir</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Pour les participants</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Soumission de projets via URL</li>
                <li>Profils personnalisables</li>
                <li>Historique des participations</li>
                <li>Système de notation transparent</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Pour les administrateurs</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Gestion des challenges et thèmes</li>
                <li>Gestion des utilisateurs et permissions</li>
                <li>Tableaux de bord analytiques</li>
                <li>Système de modération</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} ChallengeDev. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}