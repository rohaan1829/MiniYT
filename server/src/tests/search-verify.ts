// No import needed for fetch in Node 18+
export { };

const BASE_URL = 'http://localhost:4001/api';

async function verifySearch() {
    console.log('🔍 Starting Unified Search Verification...');

    try {
        // 1. Search for a channel
        const channelQuery = 'Tech';
        const res1 = await fetch(`${BASE_URL}/search?q=${channelQuery}`);
        const data1 = await res1.json() as any;

        console.log(`📡 Searching for "${channelQuery}"...`);
        console.log(`✅ Channels found: ${data1.data.channels.length}`);
        console.log(`✅ Videos found: ${data1.data.videos.length}`);

        if (data1.data.channels.length === 0) throw new Error('Should find at least one channel');

        // 2. Search for a specific video
        const videoQuery = 'Quantum';
        const res2 = await fetch(`${BASE_URL}/search?q=${videoQuery}`);
        const data2 = await res2.json() as any;

        console.log(`📡 Searching for "${videoQuery}"...`);
        console.log(`✅ Channels found: ${data2.data.channels.length}`);
        console.log(`✅ Videos found: ${data2.data.videos.length}`);

        if (data2.data.videos.length === 0) throw new Error('Should find at least one video');

        console.log('\n✨ SEARCH API VERIFIED SUCCESSFULLY!');

    } catch (error) {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    }
}

verifySearch();
