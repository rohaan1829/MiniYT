import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
    console.log('🧹 Cleaning up seeded data...');

    // Delete in order to respect foreign key constraints
    await prisma.viewSnapshot.deleteMany();
    console.log('✅ Deleted view snapshots');

    await prisma.subscription.deleteMany();
    console.log('✅ Deleted subscriptions');

    await prisma.video.deleteMany();
    console.log('✅ Deleted videos');

    await prisma.channel.deleteMany();
    console.log('✅ Deleted channels');

    // Delete only the seeded test users (by email pattern)
    const deletedUsers = await prisma.user.deleteMany({
        where: {
            email: {
                in: ['tech@example.com', 'gaming@example.com', 'music@example.com']
            }
        }
    });
    console.log(`✅ Deleted ${deletedUsers.count} seeded test users`);

    console.log('✨ Cleanup completed! Your real user accounts are preserved.');
}

cleanup()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
