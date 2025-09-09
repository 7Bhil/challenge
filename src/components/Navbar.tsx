// src/components/Navbar.tsx
'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { isAdmin, isJuror, isChallenger } from '@/lib/roles'
import { useState, useEffect } from 'react'
import { 
  FiMenu, 
  FiX, 
  FiTrendingUp, 
  FiChevronDown, 
  FiAward,
  FiHome,
  FiUser,
  FiSettings,
  FiLogOut,
  FiStar,
  FiCheckSquare
} from 'react-icons/fi'

interface Challenge {
  id: number
  title: string
  type: 'CHALLENGE' | 'MINI_CHALLENGE'
  _count: {
    submissions: number
  }
}

interface RankingsStatus {
  hasGeneralRanking: boolean
  challengeRankings: number[]
}

export default function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isRankingOpen, setIsRankingOpen] = useState(false)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [rankingsStatus, setRankingsStatus] = useState<RankingsStatus>({
    hasGeneralRanking: false,
    challengeRankings: []
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(true)

  

  useEffect(() => {
    const fetchNavbarData = async () => {
      try {
        setIsLoading(true)
        
        // Charger les challenges
        const challengesResponse = await fetch('/api/challenges?includeCounts=true')
        if (challengesResponse.ok) {
          const challengesData = await challengesResponse.json()
          setChallenges(challengesData.challenges || [])
        }

        // Vérifier les classements disponibles
        const rankingsResponse = await fetch('/api/ranking/status')
        if (rankingsResponse.ok) {
          const rankingsData = await rankingsResponse.json()
          setRankingsStatus(rankingsData)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données de la navbar:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNavbarData()
  }, [pathname])
// Masquer la navbar sur les pages d'authentification
  if (pathname === '/login' || pathname === '/register') {
    return null
  }
  const userIsAdmin = session && isAdmin(session.user?.role ?? '')
  const userIsJuror = session && isJuror(session.user?.role)
  const userIsChallenger = session && isChallenger(session.user?.role)

  const handleSignOut = async () => {
    setIsOpen(false)
    await signOut({ callbackUrl: '/' })
  }

  const handleNavigation = (path: string) => {
    setIsOpen(false)
    setIsRankingOpen(false)
    router.push(path)
  }

  // Menu Classement déroulant
  const renderRankingDropdown = () => (
    <div className="relative group">
      <button 
        className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 font-medium px-3 py-2 rounded-md transition-colors"
        onClick={() => setIsRankingOpen(!isRankingOpen)}
      >
        <FiTrendingUp className="w-5 h-5" />
        <span>Classement</span>
        <FiChevronDown className={`w-4 h-4 transition-transform ${isRankingOpen ? 'rotate-180' : ''}`} />
        {rankingsStatus.hasGeneralRanking && (
          <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full ml-1">
            <FiAward className="inline mr-1 w-3 h-3" />
            Live
          </span>
        )}
      </button>

      {isRankingOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-2">
            {/* Classement Général */}
            <button
              onClick={() => handleNavigation('/ranking')}
              disabled={!rankingsStatus.hasGeneralRanking}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                rankingsStatus.hasGeneralRanking
                  ? 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <FiAward className="w-5 h-5 text-yellow-500" />
              <div className="flex-1">
                <div className="font-medium">Classement Général</div>
                <div className="text-sm text-gray-500">Tous les points accumulés</div>
              </div>
            </button>

            <div className="border-t border-gray-100 my-2"></div>

            {/* Classements par Challenge */}
            <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Par Challenge
            </div>

            {challenges.filter(challenge => 
              rankingsStatus.challengeRankings.includes(challenge.id) || challenge._count.submissions > 0
            ).map(challenge => (
              <button
                key={challenge.id}
                onClick={() => handleNavigation(`/challenges/${challenge.id}/ranking`)}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                {challenge.type === 'MINI_CHALLENGE' ? (
                  <FiStar className="w-5 h-5 text-purple-500" />
                ) : (
                  <FiAward className="w-5 h-5 text-blue-500" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{challenge.title}</div>
                  <div className="text-sm text-gray-500">
                    {challenge._count.submissions} participation(s)
                  </div>
                </div>
                {rankingsStatus.challengeRankings.includes(challenge.id) && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Scores
                  </span>
                )}
              </button>
            ))}

            {challenges.filter(challenge => 
              rankingsStatus.challengeRankings.includes(challenge.id) || challenge._count.submissions > 0
            ).length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                Aucun challenge avec classement
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href={session ? '/dashboard' : '/'} 
            className="text-2xl font-bold text-indigo-600 flex items-center space-x-2"
            onClick={() => setIsOpen(false)}
          >
            <FiAward className="w-8 h-8" />
            <span>ChallengeDev</span>
          </Link>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {status === 'loading' ? (
              // Squelette de chargement
              <div className="flex space-x-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-8 w-20 bg-gray-200 rounded-md animate-pulse"></div>
                ))}
              </div>
            ) : session ? (
              <>
                {/* Menu principal */}
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 font-medium px-3 py-2 rounded-md transition-colors"
                >
                  <FiHome className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>

                {userIsChallenger && (
                  <Link
                    href="/challenges"
                    className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 font-medium px-3 py-2 rounded-md transition-colors"
                  >
                    <FiCheckSquare className="w-5 h-5" />
                    <span>Challenges</span>
                  </Link>
                )}

                {/* Menu Classement */}
                {renderRankingDropdown()}

                {/* Menu Administration */}
                {userIsAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 font-medium px-3 py-2 rounded-md transition-colors"
                  >
                    <FiSettings className="w-5 h-5" />
                    <span>Admin</span>
                  </Link>
                )}

                {/* Menu Jury */}
                {userIsJuror && (
                  <Link
                    href="/jury"
                    className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 font-medium px-3 py-2 rounded-md transition-colors"
                  >
                    <FiStar className="w-5 h-5" />
                    <span>Jury</span>
                  </Link>
                )}

                {/* Profil utilisateur */}
                <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600"
                  >
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium">{session.user?.name}</span>
                      <span className="text-xs text-gray-500 capitalize">
                        {session.user?.role?.toLowerCase()}
                      </span>
                    </div>
                    <FiUser className="w-6 h-6 bg-indigo-100 text-indigo-600 p-1 rounded-full" />
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Déconnexion"
                  >
                    <FiLogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              // Utilisateur non connecté
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-indigo-600 font-medium px-3 py-2 rounded-md transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>

          {/* Bouton Menu Mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-indigo-600 p-2 rounded-md transition-colors"
            >
              {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {isOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {session ? (
                <>
                  <button
                    onClick={() => handleNavigation('/dashboard')}
                    className="flex items-center space-x-3 w-full px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors"
                  >
                    <FiHome className="w-5 h-5" />
                    <span>Dashboard</span>
                  </button>

                  {userIsChallenger && (
                    <button
                      onClick={() => handleNavigation('/challenges')}
                      className="flex items-center space-x-3 w-full px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors"
                    >
                      <FiCheckSquare className="w-5 h-5" />
                      <span>Challenges</span>
                    </button>
                  )}

                  {/* Classement Mobile */}
                  <div className="px-3 py-2">
                    <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Classement
                    </div>
                    <div className="space-y-1">
                      <button
                        onClick={() => handleNavigation('/ranking')}
                        className="flex items-center space-x-3 w-full px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors"
                      >
                        <FiAward className="w-5 h-5 text-yellow-500" />
                        <span>Classement Général</span>
                      </button>

                      {challenges.filter(challenge => challenge._count.submissions > 0).map(challenge => (
                        <button
                          key={challenge.id}
                          onClick={() => handleNavigation(`/challenges/${challenge.id}/ranking`)}
                          className="flex items-center space-x-3 w-full px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors"
                        >
                          {challenge.type === 'MINI_CHALLENGE' ? (
                            <FiStar className="w-5 h-5 text-purple-500" />
                          ) : (
                            <FiAward className="w-5 h-5 text-blue-500" />
                          )}
                          <span className="truncate">{challenge.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {userIsAdmin && (
                    <button
                      onClick={() => handleNavigation('/admin')}
                      className="flex items-center space-x-3 w-full px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors"
                    >
                      <FiSettings className="w-5 h-5" />
                      <span>Administration</span>
                    </button>
                  )}

                  {userIsJuror && (
                    <button
                      onClick={() => handleNavigation('/jury')}
                      className="flex items-center space-x-3 w-full px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors"
                    >
                      <FiStar className="w-5 h-5" />
                      <span>Espace Jury</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleNavigation('/profile')}
                    className="flex items-center space-x-3 w-full px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors"
                  >
                    <FiUser className="w-5 h-5" />
                    <span>Mon Profil</span>
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span>Déconnexion</span>
                  </button>
                </>
              ) : (
                // Utilisateur non connecté (mobile)
                <>
                  <button
                    onClick={() => handleNavigation('/login')}
                    className="flex items-center space-x-3 w-full px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors"
                  >
                    <FiUser className="w-5 h-5" />
                    <span>Connexion</span>
                  </button>
                  <button
                    onClick={() => handleNavigation('/register')}
                    className="flex items-center space-x-3 w-full px-3 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-md transition-colors"
                  >
                    <FiUser className="w-5 h-5" />
                    <span>Inscription</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}