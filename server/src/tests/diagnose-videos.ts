import prisma from '../config/database';

async function diagnose() {
    console.log('--- 🔍 Video Diagnosis ---');

    const videoCount = await prisma.video.count();
    console.log(`Total videos in DB: ${videoCount}`);

    const videos = await prisma.video.findMany({
        include: {
            user: {
                include: {
                    channel: true
                }
            }
        }
    });

    if (videos.length === 0) {
        console.log('❌ No videos found in database.');
    } else {
        videos.forEach(v => {
            console.log(`\nVideo ID: ${v.id}`);
            console.log(`Title: ${v.title}`);
            console.log(`Status: ${v.status}`);
            console.log(`User: ${v.user.username} (ID: ${v.userId})`);
            console.log(`Channel: ${v.user.channel?.handle || 'None'}`);
            console.log(`Video URL: ${v.videoUrl}`);
            console.log(`Thumbnail: ${v.thumbnailUrl}`);
            console.log(`Created At: ${v.createdAt}`);
        });
    }

    const channels = await prisma.channel.findMany();
    console.log(`\nTotal channels: ${channels.length}`);
    channels.forEach(c => {
        console.log(`Channel: ${c.name} (${c.handle}) - ID: ${c.id}`);
    });

    console.log('\n--- 🏁 End Diagnosis ---');
}

diagnose()
    .catch(err => console.error(err))
    .finally(() => prisma.$disconnect());
