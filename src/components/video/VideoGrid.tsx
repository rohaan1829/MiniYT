import { CATEGORIES } from '@/data/mockData';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import VideoCard from './VideoCard';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { videoApi } from '@/lib/api/videos';
import { Loader2 } from 'lucide-react';

export default function VideoGrid() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [videos, setVideos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchVideos() {
            setIsLoading(true);
            try {
                // Fetch videos with the selected category from the backend
                const response = await videoApi.getVideos({
                    category: activeCategory === 'all' ? undefined : activeCategory
                });
                setVideos(response.data);
            } catch (error) {
                console.error('Failed to fetch videos:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchVideos();
    }, [activeCategory]);

    const filteredVideos = videos;

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

            {/* Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                    {filteredVideos.length > 0 ? (
                        filteredVideos.map((video) => (
                            <VideoCard key={video.id} video={video} />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center text-muted-foreground">
                            No videos found. Check back later!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

