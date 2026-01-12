'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, Eye, Clock, Heart, MessageCircle, Repeat2, Share, Bookmark, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatViews, formatDuration } from '@/lib/formatters';
import { useState } from 'react';

interface VideoTweetCardProps {
    video: {
        id: string;
        title: string;
        description?: string;
        thumbnailUrl?: string;
        videoUrl?: string;
        views: number;
        duration?: number;
        likeCount?: number;
        createdAt: string;
        user: {
            id: string;
            name?: string;
            channel?: {
                id: string;
                handle: string;
                name: string;
                avatarUrl?: string;
            } | null;
        };
    };
}

export default function VideoTweetCard({ video }: VideoTweetCardProps) {
    const [liked, setLiked] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
    const channelName = video.user?.channel?.name || video.user?.name || 'Unknown';
    const channelHandle = video.user?.channel?.handle || 'unknown';
    const channelAvatar = video.user?.channel?.avatarUrl;

    return (
        <article className="border-b border-white/10 transition-colors hover:bg-white/[0.02]">
            <div className="p-4 flex gap-3">
                {/* Avatar */}
                <Link href={`/channel/${channelHandle}`} className="shrink-0">
                    <Avatar className="h-10 w-10 hover:opacity-80 transition-opacity">
                        <AvatarImage src={channelAvatar ? (channelAvatar.startsWith('http') ? channelAvatar : `${backendUrl}${channelAvatar}`) : undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary font-bold">
                            {channelName[0]?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 min-w-0 text-[15px]">
                            <Link
                                href={`/channel/${channelHandle}`}
                                className="font-bold hover:underline truncate"
                            >
                                {channelName}
                            </Link>
                            <span className="text-muted-foreground truncate">@{channelHandle}</span>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-muted-foreground shrink-0">
                                {formatDistanceToNow(new Date(video.createdAt), { addSuffix: false })}
                            </span>
                        </div>

                        <button className="p-1.5 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </div>

                    {/* Video Title as Post Content */}
                    <p className="text-[15px] leading-relaxed mt-1 font-medium">
                        {video.title}
                    </p>

                    {video.description && (
                        <p className="text-[15px] text-muted-foreground mt-1 line-clamp-2">
                            {video.description}
                        </p>
                    )}

                    {/* Video Thumbnail Card */}
                    <Link href={`/watch/${video.id}`} className="block mt-3">
                        <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video group">
                            {video.thumbnailUrl ? (
                                <img
                                    src={video.thumbnailUrl.startsWith('http') ? video.thumbnailUrl : `${backendUrl}${video.thumbnailUrl}`}
                                    alt={video.title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                                    <Play className="h-12 w-12 text-white/30" />
                                </div>
                            )}

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                            {/* Play Button */}
                            <div className="absolute inset-0 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                                <div className="w-16 h-16 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                                    <Play className="h-7 w-7 text-white fill-white ml-1" />
                                </div>
                            </div>

                            {/* Duration Badge */}
                            {video.duration && video.duration > 0 && (
                                <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 text-white text-xs font-bold rounded-md flex items-center gap-1.5 backdrop-blur-sm">
                                    <Clock className="h-3 w-3" />
                                    {formatDuration(video.duration)}
                                </div>
                            )}

                            {/* View Count */}
                            <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/80 text-white text-xs font-medium rounded-md flex items-center gap-1.5 backdrop-blur-sm">
                                <Eye className="h-3 w-3" />
                                {formatViews(video.views)} views
                            </div>
                        </div>
                    </Link>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between mt-3 -ml-2 max-w-md">
                        {/* Reply/Comment */}
                        <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary group transition-colors">
                            <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                                <MessageCircle className="h-[18px] w-[18px]" />
                            </div>
                        </button>

                        {/* Repost/Share */}
                        <button className="flex items-center gap-1.5 text-muted-foreground hover:text-green-500 group transition-colors">
                            <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                                <Repeat2 className="h-[18px] w-[18px]" />
                            </div>
                        </button>

                        {/* Like */}
                        <button
                            onClick={() => setLiked(!liked)}
                            className={`flex items-center gap-1.5 group transition-colors ${liked ? 'text-pink-500' : 'text-muted-foreground hover:text-pink-500'
                                }`}
                        >
                            <div className="p-2 rounded-full group-hover:bg-pink-500/10 transition-colors">
                                <Heart className={`h-[18px] w-[18px] ${liked ? 'fill-current' : ''}`} />
                            </div>
                            <span className="text-sm">{video.likeCount && video.likeCount > 0 ? formatViews(video.likeCount) : ''}</span>
                        </button>

                        {/* Bookmark */}
                        <button
                            onClick={() => setBookmarked(!bookmarked)}
                            className={`text-muted-foreground hover:text-primary group transition-colors ${bookmarked ? 'text-primary' : ''
                                }`}
                        >
                            <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                                <Bookmark className={`h-[18px] w-[18px] ${bookmarked ? 'fill-current' : ''}`} />
                            </div>
                        </button>

                        {/* Share */}
                        <button className="text-muted-foreground hover:text-primary group transition-colors">
                            <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                                <Share className="h-[18px] w-[18px]" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}
