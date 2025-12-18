import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreVertical } from 'lucide-react';
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

    return (
        <Link href={`/watch/${id}`} className={cn("block group cursor-pointer", className)}>
            <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-muted">
                <img
                    src={thumbnail}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-xs font-medium rounded">
                    {duration}
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>

            <div className="flex gap-3">
                <Avatar className="h-9 w-9 cursor-pointer border border-white/10">
                    <AvatarImage src={channelAvatar} />
                    <AvatarFallback>{channelName?.[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                    <h3 className="font-semibold text-base leading-tight mb-1 line-clamp-2 group-hover:text-primary transition-colors text-foreground">
                        {title}
                    </h3>
                    <div className="text-sm text-muted-foreground">
                        <Link href={`/channel/${channelHandle}`} className="hover:text-foreground transition-colors font-medium">
                            {channelName}
                        </Link>
                        <div className="flex items-center">
                            <span>{views} views</span>
                            <span className="mx-1">•</span>
                            <span>{postedAt}</span>
                        </div>
                    </div>
                </div>

                <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-full h-fit transition-all text-foreground">
                    <MoreVertical className="h-5 w-5" />
                </button>
            </div>
        </Link>
    );
}
