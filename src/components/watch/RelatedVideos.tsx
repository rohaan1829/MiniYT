'use client';

import { VIDEOS } from '@/data/mockData';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RelatedVideos({ currentVideoId }: { currentVideoId: string }) {
    const router = useRouter();
    // Filter out current video
    const relatedVideos = VIDEOS.filter(v => v.id !== currentVideoId);

    return (
        <div className="space-y-3">
            <h3 className="font-bold text-lg mb-4 hidden lg:block">Up Next</h3>
            {relatedVideos.map((video) => (
                <div
                    key={video.id}
                    className="flex gap-2 group cursor-pointer"
                    onClick={() => router.push(`/watch/${video.id}`)}
                >
                    <div className="relative w-40 h-24 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                        <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-white text-[10px] font-medium rounded">
                            {video.duration}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm line-clamp-2 leading-tight mb-1 group-hover:text-primary transition-colors">
                            {video.title}
                        </h4>
                        <div className="text-xs text-muted-foreground">
                            <div className="hover:text-foreground transition-colors mb-0.5">
                                {video.channelName}
                            </div>
                            <div>
                                {video.views} views • {video.postedAt}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
