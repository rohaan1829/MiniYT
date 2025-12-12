'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { cn } from '@/lib/utils';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

interface HLSPlayerProps {
    src: string;
    poster?: string;
    className?: string;
}

export default function HLSPlayer({ src, poster, className }: HLSPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const ambientRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    // Initial HLS Setup
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let hls: Hls | null = null;

        if (Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
        }

        return () => {
            if (hls) {
                hls.destroy();
            }
        };
    }, [src]);

    // Ambilight Effect
    useEffect(() => {
        const video = videoRef.current;
        const canvas = ambientRef.current;
        if (!video || !canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let animationFrameId: number;

        const drawAmbient = () => {
            if (video.paused || video.ended) return;

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            animationFrameId = requestAnimationFrame(drawAmbient);
        };

        const onPlay = () => {
            drawAmbient();
        };

        video.addEventListener('play', onPlay);

        // Trigger once to capture poster/first frame
        if (video.readyState >= 2) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }

        return () => {
            video.removeEventListener('play', onPlay);
            cancelAnimationFrame(animationFrameId);
        };
    }, [src]); // Re-run if src changes

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

            const video = videoRef.current;
            if (!video) return;

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'f':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'm':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'arrowleft':
                    e.preventDefault();
                    video.currentTime = Math.max(0, video.currentTime - 10);
                    break;
                case 'arrowright':
                    e.preventDefault();
                    video.currentTime = Math.min(video.duration, video.currentTime + 10);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, isMuted]); // Dependencies for toggles

    const togglePlay = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPlaying(true);
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleFullscreen = () => {
        if (containerRef.current) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                containerRef.current.requestFullscreen();
            }
        }
    };

    return (
        <div ref={containerRef} className={cn('relative group w-full aspect-video isolate', className)}>
            {/* Ambilight Background Layer */}
            <canvas
                ref={ambientRef}
                className="absolute inset-0 w-full h-full -z-10 blur-3xl opacity-50 scale-105 transition-opacity duration-700"
                width={32}
                height={18}
            />

            {/* Main Player Container */}
            <div className="relative w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                <video
                    ref={videoRef}
                    poster={poster}
                    className="w-full h-full object-contain"
                    onClick={togglePlay}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    crossOrigin="anonymous"
                />

                {/* Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-4">
                    <button onClick={togglePlay} className="text-white hover:text-primary transition-transform hover:scale-110">
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>

                    <button onClick={toggleMute} className="text-white hover:text-primary transition-transform hover:scale-110">
                        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                    </button>

                    <div className="flex-1 text-xs text-gray-300 font-medium px-4">
                        {/* TODO: Add Progress Bar */}
                    </div>

                    <button onClick={toggleFullscreen} className="text-white hover:text-primary transition-transform hover:scale-110">
                        <Maximize size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
}
