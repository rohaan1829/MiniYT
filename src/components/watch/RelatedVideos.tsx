'use client';

import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { formatViews, formatTimeAgo, formatDuration } from '@/lib/formatters';

export default function RelatedVideos({ videos }: { videos: any[] }) {
    const router = useRouter();
    const { cinematicMode } = useStore();

    return (
        <>
            <div className={cn(
                cinematicMode
                    ? "contents"
                    : "space-y-3"
            )}>
                {videos.map((video) => (
                    <div
                        key={video.id}
                        className={cn(
                            "group cursor-pointer transition-all duration-300 ease-out",
                            cinematicMode
                                ? "flex flex-col gap-2"
                                : "flex gap-2"
                        )}
                        onClick={() => router.push(`/watch/${video.id}`)}
                    >
                        <div className={cn(
                            "relative bg-muted rounded-lg overflow-hidden flex-shrink-0 transition-all duration-300 ease-out",
                            cinematicMode
                                ? "w-full aspect-video"
                                : "w-40 h-24"
                        )}>
                            <img
                                src={video.thumbnailUrl}
                                alt={video.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-white text-[10px] font-medium rounded">
                                {formatDuration(video.duration)}
                            </div>
                        </div>

                        <div className={cn(
                            "min-w-0 flex-1",
                            cinematicMode && "pt-1"
                        )}>
                            <h4 className={cn(
                                "font-semibold line-clamp-2 leading-tight mb-1 group-hover:text-primary transition-colors",
                                cinematicMode ? "text-base" : "text-sm"
                            )}>
                                {video.title}
                            </h4>
                            <div className="text-xs text-muted-foreground">
                                <div className="hover:text-foreground transition-colors mb-0.5">
                                    {video.user?.channel?.name || video.user?.name}
                                </div>
                                <div>
                                    {formatViews(video.views)} views • {formatTimeAgo(video.createdAt)}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
