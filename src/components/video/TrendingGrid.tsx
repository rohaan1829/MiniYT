'use client';

import { useState, useEffect } from 'react';
import { videoApi } from '@/lib/api/videos';
import VideoCard from './VideoCard';
import { Loader2 } from 'lucide-react';

const CATEGORIES = ['All', 'Music', 'Gaming', 'Sports', 'News', 'Education', 'Entertainment'];
const TIME_RANGES = [
    { label: 'Now', value: 'now' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
];

export default function TrendingGrid() {
    const [videos, setVideos] = useState<any[]>([]);
    const [categories, setCategories] = useState<string[]>(CATEGORIES);
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeTimeRange, setActiveTimeRange] = useState('today');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTrending = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await videoApi.getTrendingVideos({
                category: activeCategory.toLowerCase(),
                timeRange: activeTimeRange,
                limit: 50,
            });

            if (response.success) {
                setVideos(response.data.videos || []);

                // Update categories from backend
                if (response.data.categories && response.data.categories.length > 0) {
                    const formattedCategories = response.data.categories.map(
                        (cat: string) => cat.charAt(0).toUpperCase() + cat.slice(1)
                    );
                    setCategories(formattedCategories);
                }
            }
        } catch (err: any) {
            console.error('Failed to fetch trending videos:', err);
            setError(err.message || 'Failed to load trending videos');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTrending();

        // Auto-refresh every 5 minutes
        const interval = setInterval(fetchTrending, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [activeCategory, activeTimeRange]);

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="space-y-4">
                {/* Time Range Filter */}
                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                    {TIME_RANGES.map((range) => (
                        <button
                            key={range.value}
                            onClick={() => setActiveTimeRange(range.value)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTimeRange === range.value
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary hover:bg-secondary/80'
                                }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeCategory === category
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary hover:bg-secondary/80'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : error ? (
                <div className="text-center py-20">
                    <p className="text-destructive text-lg">{error}</p>
                    <button
                        onClick={fetchTrending}
                        className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90"
                    >
                        Try Again
                    </button>
                </div>
            ) : videos.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <p className="text-xl">No trending videos found.</p>
                    <p className="mt-2">Check back later!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                    {videos.map((video, index) => (
                        <div key={video.id} className="relative group">
                            {/* Rank Number Overlay */}
                            <div className="absolute -left-2 -top-2 w-8 h-8 flex items-center justify-center bg-black/80 text-white font-bold text-lg rounded-full border border-white/20 z-10 shadow-xl pointer-events-none">
                                {index + 1}
                            </div>
                            <VideoCard video={video} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
