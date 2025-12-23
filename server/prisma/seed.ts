import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // 1. Clear existing data (NEVER delete users - preserve user accounts)
    await prisma.viewSnapshot.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.video.deleteMany();
    await prisma.channel.deleteMany();
    // NOTE: Users are preserved intentionally

    console.log('🧹 Database cleared (users preserved)');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 2. Create users and channels
    const channelsData = [
        {
            email: 'tech@example.com',
            username: 'techvisionary',
            name: 'Tech Visionary',
            handle: '@techvisionary',
            description: 'Exploring the bleeding edge of technology and artificial intelligence.',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tech',
            bannerUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2000&auto=format&fit=crop',
        },
        {
            email: 'gaming@example.com',
            username: 'gamingnexus',
            name: 'Gaming Nexus',
            handle: '@gamingnexus',
            description: 'Your ultimate source for gaming news, reviews, and deep dives.',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gaming',
            bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2000&auto=format&fit=crop',
        },
        {
            email: 'music@example.com',
            username: 'chillhop',
            name: 'Chill Hop',
            handle: '@chillhop',
            description: 'Relaxing beats to help you study, work, or just chill out.',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Music',
            bannerUrl: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=2000&auto=format&fit=crop',
        }
    ];

    for (const c of channelsData) {
        const user = await prisma.user.create({
            data: {
                email: c.email,
                username: c.username,
                name: c.name,
                password: hashedPassword,
                channel: {
                    create: {
                        name: c.name,
                        handle: c.handle,
                        description: c.description,
                        avatarUrl: c.avatarUrl,
                        bannerUrl: c.bannerUrl,
                        subscriberCount: Math.floor(Math.random() * 1000000),
                        videoCount: 2,
                        verified: true,
                    }
                }
            }
        });
        console.log(`✅ Created user and channel for: ${c.name}`);

        // 3. Create videos for each channel
        if (c.username === 'techvisionary') {
            await prisma.video.createMany({
                data: [
                    {
                        userId: user.id,
                        title: "Building the Future of AI Agents",
                        description: "Join us as we explore the cutting-edge developments in artificial intelligence agents.",
                        thumbnailUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop",
                        videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
                        views: 1200000,
                        duration: 860,
                        status: 'ready',
                        category: 'education',
                        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
                    },
                    {
                        userId: user.id,
                        title: "Understanding Quantum Computing",
                        description: "Quantum computing explained in simple terms.",
                        thumbnailUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1000&auto=format&fit=crop",
                        videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
                        views: 900000,
                        duration: 605,
                        status: 'ready',
                        category: 'education',
                        publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
                    }
                ]
            });
        } else if (c.username === 'gamingnexus') {
            await prisma.video.createMany({
                data: [
                    {
                        userId: user.id,
                        title: "Cyberpunk 2077: Phantom Liberty Review",
                        description: "Is Phantom Liberty worth your time?",
                        thumbnailUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop",
                        videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
                        views: 850000,
                        duration: 1335,
                        status: 'ready',
                        category: 'gaming',
                        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
                    }
                ]
            });
        } else if (c.username === 'chillhop') {
            await prisma.video.createMany({
                data: [
                    {
                        userId: user.id,
                        title: "Lo-Fi Beats to Study/Relax To",
                        description: "Smooth beats for your daily grind.",
                        thumbnailUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1000&auto=format&fit=crop",
                        videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
                        views: 2500000,
                        duration: 3600,
                        status: 'ready',
                        category: 'music',
                        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
                    }
                ]
            });
        }
    }

    console.log('✨ Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
