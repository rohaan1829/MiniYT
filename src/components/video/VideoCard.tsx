'use client';

import { Video } from '@/data/mockData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoCardProps {
    video: Video;
    className?: string;
    aspect?: 'video' | 'vertical' | 'square'; // Keeping interface for compatibility but ignoring aspect for now
}

import Link from 'next/link';

export default function VideoCard({ video, className }: VideoCardProps) {
    return (
        <Link href={`/watch/${video.id}`} className={cn("block group cursor-pointer", className)}>
            <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-muted">
                <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-xs font-medium rounded">
                    {video.duration}
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>

            <div className="flex gap-3">
                <Avatar className="h-9 w-9 cursor-pointer border border-white/10">
                    <AvatarImage src={video.channelAvatar} />
                    <AvatarFallback>{video.channelName[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                    <h3 className="font-semibold text-base leading-tight mb-1 line-clamp-2 group-hover:text-primary transition-colors text-foreground">
                        {video.title}
                    </h3>
                    <div className="text-sm text-muted-foreground">
                        <div className="hover:text-foreground transition-colors font-medium">
                            {video.channelName}
                        </div>
                        <div className="flex items-center">
                            <span>{video.views} views</span>
                            <span className="mx-1">•</span>
                            <span>{video.postedAt}</span>
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
