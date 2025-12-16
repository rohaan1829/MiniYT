'use client';

import { VIDEOS } from '@/data/mockData';
import VideoCard from './VideoCard';
import { useMemo } from 'react';

// Helper to parse view count string into number
function parseViews(viewString: string): number {
    const cleanString = viewString.toLowerCase().replace(' views', '');
    const numberPart = parseFloat(cleanString);

    if (cleanString.endsWith('m')) {
        return numberPart * 1_000_000;
    } else if (cleanString.endsWith('k')) {
        return numberPart * 1_000;
    }
    return numberPart;
}

export default function TrendingGrid() {
    // Sort videos by views (descending)
    const trendingVideos = useMemo(() => {
        return [...VIDEOS].sort((a, b) => {
            const viewsA = parseViews(a.views);
            const viewsB = parseViews(b.views);
            return viewsB - viewsA;
        });
    }, []);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                {trendingVideos.map((video, index) => (
                    <div key={video.id} className="relative group">
                        {/* Rank Number Overlay */}
                        <div className="absolute -left-2 -top-2 w-8 h-8 flex items-center justify-center bg-black/80 text-white font-bold text-lg rounded-full border border-white/20 z-10 shadow-xl pointer-events-none">
                            {index + 1}
                        </div>
                        <VideoCard video={video} />
                    </div>
                ))}
            </div>
        </div>
    );
}
