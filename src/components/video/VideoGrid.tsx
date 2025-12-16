'use client';

import { CATEGORIES, VIDEOS } from '@/data/mockData';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import VideoCard from './VideoCard';
import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Fisher-Yates shuffle algorithm for unbiased randomization
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export default function VideoGrid() {
    const [activeCategory, setActiveCategory] = useState('all');

    // Deterministic initial state for server/hydration match
    const [shuffledVideos, setShuffledVideos] = useState<any[]>(() => {
        return [...VIDEOS, ...VIDEOS.map(v => ({ ...v, id: `repeat-${v.id}` }))];
    });

    // Shuffle only on client side after mount
    useEffect(() => {
        setShuffledVideos(prev => shuffleArray([...prev]));
    }, []);

    // Filter videos based on active category
    const filteredVideos = useMemo(() => {
        if (activeCategory === 'all') {
            return shuffledVideos;
        }
        return shuffledVideos.filter(video => video.category === activeCategory);
    }, [activeCategory, shuffledVideos]);

    return (
        <div className="space-y-6">
            {/* Categories */}
            <ScrollArea className="w-full whitespace-nowrap pb-2">
                <div className="flex space-x-2">
                    {CATEGORIES.map((category) => (
                        <Badge
                            key={category.id}
                            variant={activeCategory === category.id ? "default" : "secondary"}
                            className={cn(
                                "cursor-pointer px-4 py-1.5 text-sm rounded-lg transition-all",
                                activeCategory === category.id
                                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            )}
                            onClick={() => setActiveCategory(category.id)}
                        >
                            {category.name}
                        </Badge>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" className="hidden" />
            </ScrollArea>

            {/* Standard Grid - Randomized on each page load, filtered by category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                {filteredVideos.length > 0 ? (
                    filteredVideos.map((video) => (
                        <VideoCard key={video.id} video={video} />
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center text-muted-foreground">
                        No videos found in this category.
                    </div>
                )}
            </div>
        </div>
    );
}

