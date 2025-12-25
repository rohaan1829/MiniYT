'use client';

import { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { likesApi, LikeStatus } from '@/lib/api/interactions';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { formatViews } from '@/lib/formatters';

interface LikeButtonProps {
    videoId: string;
    className?: string;
    showCount?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export default function LikeButton({ videoId, className, showCount = true, size = 'md' }: LikeButtonProps) {
    const { user } = useStore();
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await likesApi.getLikeStatus(videoId);
                if (response.success) {
                    setLiked(response.data.liked);
                    setLikeCount(response.data.likeCount);
                }
            } catch (err) {
                console.error('Failed to fetch like status:', err);
            }
        };
        fetchStatus();
    }, [videoId]);

    const handleLike = async () => {
        if (!user) {
            // Could show login modal here
            return;
        }

        if (loading) return;

        // Optimistic update with animation
        setAnimating(true);
        setLiked(!liked);
        setLikeCount(prev => liked ? prev - 1 : prev + 1);

        setLoading(true);
        try {
            const response = await likesApi.toggleLike(videoId);
            if (response.success) {
                setLiked(response.data.liked);
                setLikeCount(response.data.likeCount);
            }
        } catch (err) {
            // Revert on error
            setLiked(liked);
            setLikeCount(likeCount);
            console.error('Failed to toggle like:', err);
        } finally {
            setLoading(false);
            setTimeout(() => setAnimating(false), 300);
        }
    };

    const sizeClasses = {
        sm: 'h-8 px-3 gap-1.5',
        md: 'h-10 px-4 gap-2',
        lg: 'h-12 px-5 gap-2.5'
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    return (
        <Button
            variant={liked ? "default" : "secondary"}
            onClick={handleLike}
            disabled={loading}
            className={cn(
                "rounded-full font-bold transition-all duration-300",
                sizeClasses[size],
                liked && "bg-pink-500 hover:bg-pink-600 text-white",
                animating && "scale-110",
                className
            )}
        >
            <Heart
                className={cn(
                    iconSizes[size],
                    "transition-all duration-300",
                    liked && "fill-current",
                    animating && liked && "animate-pulse"
                )}
            />
            {showCount && (
                <span className="font-bold">
                    {formatViews(likeCount)}
                </span>
            )}
        </Button>
    );
}
