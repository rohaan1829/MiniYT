'use client';

import { useState } from 'react';
import { Video } from '@/data/mockData';
import HLSPlayer from '@/components/player/HLSPlayer';
import Comments from './Comments';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Share2, MoreHorizontal, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function VideoPlayerSection({ video }: { video: Video }) {
    const [isDescExpanded, setIsDescExpanded] = useState(false);

    return (
        <div className="flex flex-col gap-4">
            {/* Player */}
            <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative z-10">
                <HLSPlayer src={video.videoUrl} className="w-full h-full" poster={video.thumbnail} />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold mt-2">{video.title}</h1>

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Channel Info */}
                <div className="flex items-center gap-4">
                    <Avatar className="w-10 h-10 md:w-12 md:h-12 border border-border">
                        <AvatarImage src={video.channelAvatar} />
                        <AvatarFallback>{video.channelName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <Link href={`/channel/${video.channelName.replace(/\s+/g, '-').toLowerCase()}`} className="font-bold text-base md:text-lg hover:text-primary transition-colors">
                            {video.channelName}
                        </Link>
                        <span className="text-xs text-muted-foreground">{video.subscribers || '1M'} subscribers</span>
                    </div>
                    <Button className="ml-4 rounded-full px-6 font-semibold bg-white text-black hover:bg-gray-200 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                        Subscribe
                    </Button>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    <div className="flex items-center bg-secondary rounded-full">
                        <Button variant="ghost" className="rounded-l-full px-4 border-r border-border/50 hover:bg-secondary-foreground/10 gap-2">
                            <ThumbsUp className="w-5 h-5" />
                            <span className="font-semibold">{video.likes || '10K'}</span>
                        </Button>
                        <Button variant="ghost" className="rounded-r-full px-4 hover:bg-secondary-foreground/10">
                            <ThumbsDown className="w-5 h-5" />
                        </Button>
                    </div>

                    <Button variant="secondary" className="rounded-full gap-2 hover:bg-secondary-foreground/10">
                        <Share2 className="w-5 h-5" />
                        Share
                    </Button>

                    <Button variant="secondary" className="rounded-full gap-2 hover:bg-secondary-foreground/10 hidden sm:flex">
                        <Download className="w-5 h-5" />
                        Download
                    </Button>

                    <Button variant="secondary" size="icon" className="rounded-full hover:bg-secondary-foreground/10">
                        <MoreHorizontal className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Description */}
            <div className="bg-secondary/50 rounded-xl p-4 mt-2 cursor-pointer hover:bg-secondary/70 transition-colors" onClick={() => setIsDescExpanded(!isDescExpanded)}>
                <div className="flex gap-2 font-bold text-sm mb-2">
                    <span>{video.views} views</span>
                    <span>{video.postedAt}</span>
                </div>
                <div className={cn("text-sm whitespace-pre-wrap relative overflow-hidden", !isDescExpanded && "max-h-20 mask-linear-fade")}>
                    {video.description}
                </div>
                <button className="text-sm font-bold mt-2 text-muted-foreground hover:text-foreground">
                    {isDescExpanded ? 'Show less' : '...more'}
                </button>
            </div>

            {/* Comments */}
            <Comments comments={video.comments || []} />
        </div>
    );
}

import Link from 'next/link';
