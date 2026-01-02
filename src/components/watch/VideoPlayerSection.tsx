'use client';

import { useState, useCallback, useEffect } from 'react';
import HLSPlayer from '@/components/player/HLSPlayer';
import Comments from './Comments';
import PublicComments from './PublicComments';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Share2, MoreHorizontal, Download, ListPlus, ListChecks, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatViews, formatTimeAgo } from '@/lib/formatters';
import { API_ROOT_URL } from '@/lib/api/client';
import SubscribeButton from '@/components/channel/SubscribeButton';
import { likesApi } from '@/lib/api/interactions';
import { useToast } from '@/hooks/use-toast';

export default function VideoPlayerSection({ video }: { video: any }) {
    const { cinematicMode, addToHistory, addToLibrary, library, user, isAuthenticated } = useStore();
    const { toast } = useToast();
    const [isDescExpanded, setIsDescExpanded] = useState(false);
    const [isLiked, setIsLiked] = useState(video.isLiked || false);
    const [likeCount, setLikeCount] = useState(video.likeCount || 0);
    const [isDisliked, setIsDisliked] = useState(video.isDisliked || false);
    const [dislikeCount, setDislikeCount] = useState(video.dislikeCount || 0);
    const [isInteracting, setIsInteracting] = useState(false);
    const router = useRouter();

    const inLibrary = library.some(v => v.id === video.id);
    const channel = video.user?.channel;

    useEffect(() => {
        if (video) {
            addToHistory(video);
            setIsLiked(video.isLiked || false);
            setLikeCount(video.likeCount || 0);
            setIsDisliked(video.isDisliked || false);
            setDislikeCount(video.dislikeCount || 0);
        }
    }, [video, addToHistory]);

    const handleLike = async () => {
        if (!isAuthenticated) {
            toast({
                title: 'Sign in required',
                description: 'Please sign in to like videos.',
                variant: 'destructive',
            });
            return;
        }

        setIsInteracting(true);
        // Optimistic update
        const newLiked = !isLiked;
        const wasDisliked = isDisliked;

        setIsLiked(newLiked);
        setLikeCount((prev: number) => newLiked ? prev + 1 : Math.max(0, prev - 1));
        if (newLiked && wasDisliked) {
            setIsDisliked(false);
            setDislikeCount((prev: number) => Math.max(0, prev - 1));
        }

        try {
            const response = await likesApi.toggleLike(video.id);
            if (response.success) {
                setIsLiked(response.data.liked);
                setLikeCount(response.data.likeCount);
                setIsDisliked(response.data.disliked);
                setDislikeCount(response.data.dislikeCount);
            }
        } catch (error) {
            // Revert is complex, just sync back
            toast({
                title: 'Error',
                description: 'Failed to update like.',
                variant: 'destructive',
            });
        } finally {
            setIsInteracting(false);
        }
    };

    const handleDislike = async () => {
        if (!isAuthenticated) {
            toast({
                title: 'Sign in required',
                description: 'Please sign in to dislike videos.',
                variant: 'destructive',
            });
            return;
        }

        setIsInteracting(true);
        // Optimistic update
        const newDisliked = !isDisliked;
        const wasLiked = isLiked;

        setIsDisliked(newDisliked);
        setDislikeCount((prev: number) => newDisliked ? prev + 1 : Math.max(0, prev - 1));
        if (newDisliked && wasLiked) {
            setIsLiked(false);
            setLikeCount((prev: number) => Math.max(0, prev - 1));
        }

        try {
            const response = await likesApi.toggleDislike(video.id);
            if (response.success) {
                setIsLiked(response.data.liked);
                setLikeCount(response.data.likeCount);
                setIsDisliked(response.data.disliked);
                setDislikeCount(response.data.dislikeCount);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update dislike.',
                variant: 'destructive',
            });
        } finally {
            setIsInteracting(false);
        }
    };


    return (
        <div className="flex flex-col gap-4">
            <div
                className={cn(
                    "video-player-wrapper w-full bg-black rounded-2xl overflow-hidden shadow-2xl relative z-10",
                    cinematicMode
                        ? "max-h-[calc(100vh-120px)]"
                        : "aspect-video"
                )}
            >
                {/* For real videos, we might have standard MP4 or HLS. 
                    If it's a relative path /uploads/..., we use the backend URL.
                */}
                <HLSPlayer
                    src={video.videoUrl.startsWith('http') ? video.videoUrl : `${API_ROOT_URL}${video.videoUrl}`}
                    className={cn(
                        "w-full",
                        cinematicMode ? "h-[calc(100vh-120px)]" : "h-full"
                    )}
                    poster={video.thumbnailUrl}
                    autoPlay={true}
                    videoId={video.id}
                />
            </div>

            <h1 className="text-2xl font-bold mt-2">{video.title}</h1>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Avatar className="w-10 h-10 md:w-12 md:h-12 border border-border">
                        <AvatarImage src={channel?.avatarUrl} />
                        <AvatarFallback>{(channel?.name || video.user?.name || '?')[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <Link href={`/channel/${channel?.handle || '#'}`} className="font-bold text-base md:text-lg hover:text-primary transition-colors">
                            {channel?.name || video.user?.name}
                        </Link>
                        <span className="text-xs text-muted-foreground">{formatViews(channel?.subscriberCount || 0)} subscribers</span>
                    </div>
                    <SubscribeButton
                        channelId={channel?.id}
                        channelName={channel?.name || video.user?.name}
                        initialSubscribed={channel?.isSubscribed}
                        initialNotify={channel?.notifyOnNewVideo}
                        subscriberCount={channel?.subscriberCount}
                        className="ml-4"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    <div className="flex items-center bg-secondary rounded-full">
                        <Button
                            variant="ghost"
                            onClick={handleLike}
                            disabled={isInteracting}
                            className={cn(
                                "rounded-l-full px-4 border-r border-border/50 hover:bg-secondary-foreground/10 gap-2 transition-colors",
                                isLiked && "text-primary"
                            )}
                        >
                            <ThumbsUp className={cn("w-5 h-5", isLiked && "fill-primary")} />
                            <span className="font-semibold">{formatViews(likeCount)}</span>
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={handleDislike}
                            disabled={isInteracting}
                            className={cn(
                                "rounded-r-full px-4 hover:bg-secondary-foreground/10 gap-2 transition-colors",
                                isDisliked && "text-primary"
                            )}
                        >
                            <ThumbsDown className={cn("w-5 h-5", isDisliked && "fill-primary")} />
                            {dislikeCount > 0 && <span className="font-semibold ml-2">{formatViews(dislikeCount)}</span>}
                        </Button>
                    </div>

                    <Button variant="secondary" size="sm" className="space-x-2 rounded-full hover:bg-secondary/80">
                        <Share2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Share</span>
                    </Button>

                    <Button
                        variant="secondary"
                        size="sm"
                        className={cn(
                            "space-x-2 rounded-full hover:bg-secondary/80",
                            inLibrary && "text-primary bg-primary/10 hover:bg-primary/20"
                        )}
                        onClick={() => addToLibrary(video)}
                    >
                        {inLibrary ? <ListChecks className="w-4 h-4" /> : <ListPlus className="w-4 h-4" />}
                        <span className="hidden sm:inline">{inLibrary ? 'Saved' : 'Save'}</span>
                    </Button>

                    <Button variant="secondary" size="icon" className="rounded-full hover:bg-secondary/80">
                        <MoreHorizontal className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="bg-secondary/50 rounded-xl p-4 mt-2 cursor-pointer hover:bg-secondary/70 transition-colors" onClick={() => setIsDescExpanded(!isDescExpanded)}>
                <div className="flex gap-2 font-bold text-sm mb-2">
                    <span>{formatViews(video.views)} views</span>
                    <span>{formatTimeAgo(video.createdAt)}</span>
                </div>
                <div className={cn("text-sm whitespace-pre-wrap relative overflow-hidden", !isDescExpanded && "max-h-20 mask-linear-fade")}>
                    {video.description}
                </div>
                <button className="text-sm font-bold mt-2 text-muted-foreground hover:text-foreground">
                    {isDescExpanded ? 'Show less' : '...more'}
                </button>
            </div>

            <Comments videoId={video.id} />
            <PublicComments videoId={video.id} />
        </div>
    );
}
