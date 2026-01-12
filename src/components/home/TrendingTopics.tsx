'use client';

import { Flame } from 'lucide-react';
import Link from 'next/link';

// Mock data - in production, fetch from API
const trendingTopics = [
    { id: 1, category: 'Gaming', topic: '#MinecraftUpdate', posts: '12.5K' },
    { id: 2, category: 'Music', topic: '#NewReleases', posts: '8.2K' },
    { id: 3, category: 'Technology', topic: '#AINews', posts: '6.8K' },
    { id: 4, category: 'Entertainment', topic: '#MovieReview', posts: '4.1K' },
];

export default function TrendingTopics() {
    return (
        <div className="bg-white/5 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10">
                <h2 className="text-xl font-bold">Trending Topics</h2>
            </div>

            {/* Topics List */}
            <div>
                {trendingTopics.map((item, index) => (
                    <Link
                        key={item.id}
                        href={`/results?search_query=${encodeURIComponent(item.topic)}`}
                        className="block px-4 py-3 hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">{item.category} · Trending</p>
                                <p className="font-bold mt-0.5">{item.topic}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{item.posts} posts</p>
                            </div>
                            {index === 0 && (
                                <Flame className="h-4 w-4 text-orange-500" />
                            )}
                        </div>
                    </Link>
                ))}
            </div>

            {/* Show More */}
            <Link
                href="/trending"
                className="block px-4 py-3 text-primary hover:bg-white/5 transition-colors text-sm"
            >
                Show more
            </Link>
        </div>
    );
}
