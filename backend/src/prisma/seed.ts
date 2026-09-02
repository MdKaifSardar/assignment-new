import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial database records...');

  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
  const ownerPasswordHash = await bcrypt.hash('OwnerPass123!', 10);
  const userPasswordHash = await bcrypt.hash('UserPass123!', 10);

  // 1. System Admin User (Name >= 20 chars)
  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator Account Manager',
      email: 'admin@storeratings.com',
      passwordHash: adminPasswordHash,
      address: '101 Technology Park, Suite 400, Austin, TX',
      role: 'ADMIN',
    },
  });

  // 2. Store Owners (Names >= 20 chars)
  const owner1 = await prisma.user.create({
    data: {
      name: 'Alexander Johnathon Montgomery',
      email: 'storeowner.tech@nexus.com',
      passwordHash: ownerPasswordHash,
      address: '10880 Wilshire Boulevard, Suite 1100, Los Angeles, CA',
      role: 'STORE_OWNER',
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      name: 'Bartholomew Harrison Sterling',
      email: 'storeowner.artisan@bakery.com',
      passwordHash: ownerPasswordHash,
      address: '450 Lexington Avenue, Floor 22, New York, NY',
      role: 'STORE_OWNER',
    },
  });

  // 3. Normal Users (Names >= 20 chars)
  const user1 = await prisma.user.create({
    data: {
      name: 'Christopher Lawrence Vance',
      email: 'user.christopher@gmail.com',
      passwordHash: userPasswordHash,
      address: '452 Maple Street, Apartment 3B, Boston, MA',
      role: 'NORMAL_USER',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Elizabeth Victoria Kensington',
      email: 'user.elizabeth@gmail.com',
      passwordHash: userPasswordHash,
      address: '789 Oakridge Drive, San Jose, CA',
      role: 'NORMAL_USER',
    },
  });

  // 4. Stores
  const store1 = await prisma.store.create({
    data: {
      name: 'Apex Digital Electronics Store',
      email: 'contact@apexdigital.com',
      address: '100 Innovation Way, Silicon Valley, CA',
      ownerId: owner1.id,
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: 'Artisan Gourmet Bakery & Cafe',
      email: 'hello@gourmetbakery.com',
      address: '55 Main Street, Historical Downtown, MA',
      ownerId: owner2.id,
    },
  });

  const store3 = await prisma.store.create({
    data: {
      name: 'Urban Threads Fashion Boutique',
      email: 'info@urbanthreads.com',
      address: '88 Fashion Boulevard, Soho District, NY',
      ownerId: null,
    },
  });

  // 5. Ratings
  await prisma.rating.createMany({
    data: [
      { userId: user1.id, storeId: store1.id, value: 5 },
      { userId: user2.id, storeId: store1.id, value: 4 },
      { userId: user1.id, storeId: store2.id, value: 5 },
      { userId: user2.id, storeId: store2.id, value: 3 },
    ],
  });

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
