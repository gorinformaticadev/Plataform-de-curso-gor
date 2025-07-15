import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const adminEmail = 'admin@eduplatform.com';
  const adminPassword = 'admin123';

  // Verificar se o admin já existe
  const adminExists = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (adminExists) {
    console.log('Admin user already exists. Seeding skipped.');
    return;
  }

  // Hash da senha
  const hashedPassword = await hash(adminPassword, 12);

  // Criar o usuário admin
  await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
  });

  console.log('Admin user created successfully.');

  // Criar o segundo usuário admin
  const secondAdminEmail = 'admin@admin.com';
  const secondAdminPassword = 'Ad12345678';
  const secondAdminExists = await prisma.user.findUnique({
    where: { email: secondAdminEmail },
  });

  if (!secondAdminExists) {
    const secondHashedPassword = await hash(secondAdminPassword, 12);
    await prisma.user.create({
      data: {
        email: secondAdminEmail,
        password: secondHashedPassword,
        name: 'Second Admin',
        role: UserRole.ADMIN,
      },
    });
    console.log('Second admin user created successfully.');
  } else {
    console.log('Second admin user already exists. Seeding skipped.');
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
