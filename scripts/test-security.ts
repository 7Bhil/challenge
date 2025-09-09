// scripts/test-security.ts
import { PrismaClient } from '@prisma/client'
import { isAdmin } from '../src/lib/roles'

const prisma = new PrismaClient()

async function testSecurity() {
  console.log('🧪 Test de sécurité des rôles...')
  
  // Test 1: Vérification fonction isAdmin
  console.log('\n1. Test fonction isAdmin:')
  console.log('Challenger is admin:', isAdmin('Challenger')) // false
  console.log('Judge is admin:', isAdmin('Judge')) // false
  console.log('Admin is admin:', isAdmin('Admin')) // true
  console.log('SuperAdmin is admin:', isAdmin('SuperAdmin')) // true

  // Test 2: Vérifier un utilisateur rétrogradé
  console.log('\n2. Test utilisateur rétrogradé:')
  const downgradedUser = await prisma.user.findFirst({
    where: { role: 'Challenger', email: { contains: 'admin' } }
  })
  
  if (downgradedUser) {
    console.log('✅ Utilisateur rétrogradé trouvé:', downgradedUser.email)
    console.log('Accès admin devrait être refusé:', !isAdmin(downgradedUser.role))
  } else {
    console.log('ℹ️ Aucun utilisateur rétrogradé trouvé pour le test')
  }

  console.log('\n✅ Tests de sécurité complétés!')
}

testSecurity()
  .catch(console.error)
  .finally(() => prisma.$disconnect())