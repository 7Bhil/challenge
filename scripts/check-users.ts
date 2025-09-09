/* eslint-disable @typescript-eslint/no-explicit-any */
// scripts/check-users.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('Vérification des utilisateurs dans la base de données...')
    
    const users = await prisma.user.findMany()
    console.log(`Nombre d'utilisateurs: ${users.length}`)
    
    users.forEach((user: any) => {
      console.log(`- ${user.name} (${user.email}), rôle: ${user.role}`)
    })
    
    if (users.length === 0) {
      console.log('Aucun utilisateur trouvé. Essayez de créer un compte d\'abord.')
    }
  } catch (error) {
    console.error('Erreur lors de la vérification:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()