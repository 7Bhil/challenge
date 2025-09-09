// scripts/seed-superadmin.js
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('adminpassword', 12);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@challengedev.com' },
    update: {},
    create: {
      email: 'superadmin@challengedev.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: Role.SuperAdmin,
    },
  });

  console.log('Super Admin créé:', superAdmin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });