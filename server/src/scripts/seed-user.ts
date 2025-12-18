
import prisma from '../config/database';
import bcrypt from 'bcrypt';

async function main() {
    const email = 'test@example.com';
    const password = 'password123';
    // Use fixed username if creating, or keep existing if updating?
    // Let's use a dynamic one for creation to avoid collision if run multiple times? 
    // Actually schema says username unique. I'll try to find existing first to keep username.

    let username = 'testuser';
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        username = existing.username;
    } else {
        username = 'testuser_' + Math.floor(Math.random() * 1000);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    console.log(`Seeding user: ${email}...`);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            image: avatar,
            password: hashedPassword,
        },
        create: {
            email,
            username,
            password: hashedPassword,
            name: 'Test User',
            image: avatar,
        },
    });

    console.log('User synced:', user);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
