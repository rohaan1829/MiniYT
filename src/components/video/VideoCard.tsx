import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreVertical, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatViews, formatTimeAgo, formatDuration } from '@/lib/formatters';
import Link from 'next/link';

interface VideoCardProps {
    video: any; // Using any for transition, but we'll treat it as VideoData
    className?: string;
    aspect?: 'video' | 'vertical' | 'square';
}

export default function VideoCard({ video, className }: VideoCardProps) {
    // Determine if it's real data or mock data
    const isReal = !!video.user;

    const id = video.id;
    const title = video.title;
    const thumbnail = isReal ? video.thumbnailUrl : video.thumbnail;
    const channelName = isReal ? (video.user?.channel?.name || video.user?.name) : video.channelName;
    const channelAvatar = isReal ? video.user?.channel?.avatarUrl : video.channelAvatar;
    const channelHandle = isReal ? video.user?.channel?.handle : `@${video.channelName?.toLowerCase().replace(/\s/g, '')}`;
    const views = isReal ? formatViews(video.views) : video.views;
    const postedAt = isReal ? formatTimeAgo(video.createdAt) : video.postedAt;
    const duration = isReal ? formatDuration(video.duration) : video.duration;
    const isProcessing = isReal && video.status === 'processing';
    const isFailed = isReal && video.status === 'failed';

    return (
        <div className={cn("group cursor-pointer", className)}>
            <Link href={isProcessing ? "#" : `/watch/${id}`} className={cn("block", isProcessing && "cursor-not-allowed")}>
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-muted">
                    {thumbnail ? (
                        <img
                            src={thumbnail}
                            alt={title}
                            className={cn(
                                "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105",
                                isProcessing && "blur-sm opacity-50"
                            )}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                            <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                        </div>
                    )}
                    {!isProcessing && duration !== "0:00" && (
                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-xs font-medium rounded">
                            {duration}
                        </div>
                    )}
                    {isProcessing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white p-4">
                            <Loader2 className="h-6 w-6 animate-spin mb-2" />
                            <span className="text-xs font-bold uppercase tracking-wider">Processing</span>
                        </div>
                    )}
                    {isFailed && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/20 text-red-500 p-4">
                            <span className="text-xs font-bold uppercase tracking-wider">Failed</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
            </Link>

            <div className="flex gap-3">
                <Link href={`/channel/${channelHandle}`}>
                    <Avatar className="h-9 w-9 border border-white/10 hover:border-white/20 transition-colors">
                        <AvatarImage src={channelAvatar} />
                        <AvatarFallback>{channelName?.[0]}</AvatarFallback>
                    </Avatar>
                </Link>

                <div className="flex-1 min-w-0">
                    <Link href={`/watch/${id}`}>
                        <h3 className="font-semibold text-base leading-tight mb-1 line-clamp-2 group-hover:text-primary transition-colors text-foreground">
                            {title}
                        </h3>
                    </Link>
                    <div className="text-sm text-muted-foreground">
                        <Link href={`/channel/${channelHandle}`} className="hover:text-foreground transition-colors font-medium">
                            {channelName}
                        </Link>
                        {isProcessing ? (
                            <div className="text-primary font-medium flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                Transcoding video...
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <span>{views} views</span>
                                <span className="mx-1">•</span>
                                <span>{postedAt}</span>
                            </div>
                        )}
                    </div>
                </div>

                <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-full h-fit transition-all text-foreground">
                    <MoreVertical className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
