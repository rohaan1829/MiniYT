'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';

interface Creator {
    id: string;
    handle: string;
    name: string;
    avatarUrl?: string;
    bio?: string;
    subscriberCount: number;
}

// Mock data - in production, fetch from API
const mockCreators: Creator[] = [
    { id: '1', handle: 'techreviewer', name: 'Tech Reviewer', bio: 'Daily tech reviews and tutorials', subscriberCount: 125000 },
    { id: '2', handle: 'gamingpro', name: 'Gaming Pro', bio: 'Pro gamer and streamer', subscriberCount: 89000 },
    { id: '3', handle: 'musicmaker', name: 'Music Maker', bio: 'Creating beats and tutorials', subscriberCount: 56000 },
];

function formatSubscribers(count: number): string {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
}

export default function WhoToFollow() {
    const { isAuthenticated } = useStore();
    const [creators, setCreators] = useState<Creator[]>(mockCreators);
    const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

    const handleFollow = (creatorId: string) => {
        setFollowedIds(prev => {
            const next = new Set(prev);
            if (next.has(creatorId)) {
                next.delete(creatorId);
            } else {
                next.add(creatorId);
            }
            return next;
        });
    };

    return (
        <div className="bg-white/5 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10">
                <h2 className="text-xl font-bold">Who to follow</h2>
            </div>

            {/* Creators List */}
            <div>
                {creators.map((creator) => (
                    <div
                        key={creator.id}
                        className="px-4 py-3 hover:bg-white/5 transition-colors flex items-start gap-3"
                    >
                        <Link href={`/channel/${creator.handle}`}>
                            <Avatar className="h-10 w-10 shrink-0">
                                <AvatarImage src={creator.avatarUrl ? (creator.avatarUrl.startsWith('http') ? creator.avatarUrl : `${backendUrl}${creator.avatarUrl}`) : undefined} />
                                <AvatarFallback className="bg-primary/20 text-primary font-bold">
                                    {creator.name[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </Link>
                        <div className="flex-1 min-w-0">
                            <Link href={`/channel/${creator.handle}`} className="hover:underline">
                                <p className="font-bold text-sm truncate">{creator.name}</p>
                                <p className="text-sm text-muted-foreground truncate">@{creator.handle}</p>
                            </Link>
                            {creator.bio && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{creator.bio}</p>
                            )}
                        </div>
                        {isAuthenticated && (
                            <Button
                                size="sm"
                                variant={followedIds.has(creator.id) ? "outline" : "default"}
                                className={`rounded-full px-4 shrink-0 font-bold ${followedIds.has(creator.id)
                                        ? 'bg-transparent border-white/20 hover:border-red-500 hover:text-red-500'
                                        : 'bg-white text-black hover:bg-white/90'
                                    }`}
                                onClick={() => handleFollow(creator.id)}
                            >
                                {followedIds.has(creator.id) ? 'Following' : 'Follow'}
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            {/* Show More */}
            <Link
                href="/explore"
                className="block px-4 py-3 text-primary hover:bg-white/5 transition-colors text-sm"
            >
                Show more
            </Link>
        </div>
    );
}
