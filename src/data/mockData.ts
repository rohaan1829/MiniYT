export interface Comment {
    id: string;
    user: string;
    avatar: string;
    content: string;
    likes: number;
    postedAt: string;
}

export interface Video {
    id: string;
    title: string;
    thumbnail: string;
    channelName: string;
    channelAvatar: string;
    subscribers: string;
    views: string;
    postedAt: string;
    duration: string;
    videoUrl: string;
    description: string;
    likes: string;
    comments: Comment[];
    category: string;
    isLive?: boolean;
}

export interface Category {
    id: string;
    name: string;
}

export const CATEGORIES: Category[] = [
    { id: 'all', name: 'All' },
    { id: 'gaming', name: 'Gaming' },
    { id: 'music', name: 'Music' },
    { id: 'tech', name: 'Technology' },
    { id: 'programming', name: 'Programming' },
    { id: 'podcast', name: 'Podcasts' },
    { id: 'news', name: 'News' },
    { id: 'sports', name: 'Sports' },
    { id: 'fashion', name: 'Fashion' },
    { id: 'learning', name: 'Learning' },
];

const COMMENTS_MOCK: Comment[] = [
    {
        id: '1',
        user: 'Alex Chen',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        content: 'This is exactly what I needed to understand the current state of AI agents. Great explanation!',
        likes: 125,
        postedAt: '2 hours ago'
    },
    {
        id: '2',
        user: 'Sarah Jones',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        content: 'The production quality of this video is next level. Keep it up!',
        likes: 89,
        postedAt: '5 hours ago'
    },
    {
        id: '3',
        user: 'Dev Master',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dev',
        content: 'Can you do a deep dive into the specific frameworks mentioned? specifically LangChain integration.',
        likes: 45,
        postedAt: '1 day ago'
    },
];

export const VIDEOS: Video[] = [
    {
        id: '1',
        title: "Building the Future of AI Agents",
        thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop",
        channelName: "Tech Visionary",
        channelAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tech",
        subscribers: "1.2M",
        views: "1.2M",
        postedAt: "2 days ago",
        duration: "14:20",
        videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        likes: "45K",
        description: "Join us as we explore the cutting-edge developments in artificial intelligence agents and how they are reshaping our digital future. We dive deep into autonomous systems, LLMs, and the ethical considerations of the next generation of AI. \n\nTimestamps:\n0:00 Intro\n2:30 What are AI Agents?\n5:45 Use Cases\n10:20 Future Outlook\n13:50 Conclusion",
        comments: COMMENTS_MOCK,
        category: "tech"
    },
    {
        id: '2',
        title: "Cyberpunk 2077: Phantom Liberty Review",
        thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop",
        channelName: "Gaming Nexus",
        channelAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gaming",
        subscribers: "850K",
        views: "850K",
        postedAt: "5 hours ago",
        duration: "22:15",
        videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        likes: "32K",
        description: "Is Phantom Liberty worth your time? We break down the new story, mechanics, and the 2.0 update that completely changes the game.",
        comments: COMMENTS_MOCK,
        category: "gaming"
    },
    {
        id: '3',
        title: "Lo-Fi Beats to Relax/Study to",
        thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2TtyGStMzJzH-_ovH00UATMQ2rchVuJWcsQ&s",
        channelName: "Chill Hop",
        channelAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Music",
        subscribers: "240K",
        views: "24K",
        postedAt: "LIVE",
        duration: "LIVE",
        videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        likes: "1.5K",
        description: "Relaxing beats to help you study, work, or just chill out. Updated daily with the freshest tracks.",
        comments: COMMENTS_MOCK,
        category: "music"
    },
    {
        id: '4',
        title: "Next.js 15 Full Course 2024",
        thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000&auto=format&fit=crop",
        channelName: "Code Master",
        channelAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Code",
        subscribers: "500K",
        views: "450K",
        postedAt: "3 weeks ago",
        duration: "4:30:00",
        videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        likes: "28K",
        description: "Learn Next.js 15 from scratch! We cover App Router, Server Actions, React Server Components, and more in this comprehensive course.",
        comments: COMMENTS_MOCK,
        category: "programming"
    },
    {
        id: '5',
        title: "The Most Beautiful Places in Japan",
        thumbnail: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000&auto=format&fit=crop",
        channelName: "Travel Diaries",
        channelAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Travel",
        subscribers: "2.1M",
        views: "2.1M",
        postedAt: "1 month ago",
        duration: "18:45",
        videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        likes: "150K",
        description: "Come with us on a journey through Kyoto, Tokyo, and Osaka as we discover the hidden gems and most famous sights of Japan.",
        comments: COMMENTS_MOCK,
        category: "learning"
    },
    {
        id: '6',
        title: "Understanding Quantum Computing",
        thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1000&auto=format&fit=crop",
        channelName: "Science Explained",
        channelAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Science",
        subscribers: "900K",
        views: "900K",
        postedAt: "1 year ago",
        duration: "10:05",
        videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        likes: "45K",
        description: "Quantum computing explained in simple terms. How does it work and why does it change everything?",
        comments: COMMENTS_MOCK,
        category: "learning"
    },
    {
        id: '7',
        title: "Minimalist Desk Setup Tour 2024",
        thumbnail: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1000&auto=format&fit=crop",
        channelName: "Tech Lifestyle",
        channelAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Setup",
        subscribers: "300K",
        views: "300K",
        postedAt: "2 days ago",
        duration: "08:12",
        videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        likes: "12K",
        description: "My productive minimalist desk setup for 2024. All gear links in description.",
        comments: COMMENTS_MOCK,
        category: "tech"
    },
    {
        id: '8',
        title: "Delicious Pasta Recipe in 15 Minutes",
        thumbnail: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=1000&auto=format&fit=crop",
        channelName: "Chef's Table",
        channelAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Food",
        subscribers: "1.5M",
        views: "1.5M",
        postedAt: "4 days ago",
        duration: "12:30",
        videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        likes: "89K",
        description: "Quick and easy pasta recipe that tastes like a 5-star restaurant meal. Ingredients listed below.",
        comments: COMMENTS_MOCK,
        category: "learning"
    }
    // ... existing videos ...
];

export interface Channel {
    id: string;
    description: string;
    banner: string;
    name: string;
    avatar: string;
    subscribers: string;
    videos: Video[];
}

export const CHANNELS: Channel[] = [
    {
        id: 'tech-visionary',
        name: 'Tech Visionary',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tech',
        banner: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2000&auto=format&fit=crop',
        subscribers: '1.2M',
        description: 'Exploring the bleeding edge of technology and artificial intelligence. New videos every week.',
        videos: VIDEOS.filter(v => v.channelName === 'Tech Visionary')
    },
    {
        id: 'gaming-nexus',
        name: 'Gaming Nexus',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gaming',
        banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2000&auto=format&fit=crop',
        subscribers: '850K',
        description: 'Your ultimate source for gaming news, reviews, and deep dives.',
        videos: VIDEOS.filter(v => v.channelName === 'Gaming Nexus')
    },
    {
        id: 'chill-hop',
        name: 'Chill Hop',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Music',
        banner: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=2000&auto=format&fit=crop',
        subscribers: '240K',
        description: 'Relaxing beats to help you study, work, or just chill out.',
        videos: VIDEOS.filter(v => v.channelName === 'Chill Hop')
    }
];
