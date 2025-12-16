import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { cn } from '@/lib/utils';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, RectangleHorizontal, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface HLSPlayerProps {
    src: string;
    poster?: string;
    className?: string;
    autoPlay?: boolean;
    onEnded?: () => void;
}

// Format seconds to MM:SS or HH:MM:SS
function formatTime(seconds: number): string {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Available playback speeds
const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export default function HLSPlayer({ src, poster, className, autoPlay = false, onEnded }: HLSPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const previewVideoRef = useRef<HTMLVideoElement>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    const ambientRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [isSeeking, setIsSeeking] = useState(false);
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [hoverPosition, setHoverPosition] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [autoPlayNext, setAutoPlayNext] = useState(true);
    const [ambientMode, setAmbientMode] = useState(true);

    // Settings Menu State
    const [showSettings, setShowSettings] = useState(false);
    const [settingsView, setSettingsView] = useState<'main' | 'speed' | 'quality'>('main');
    const [qualityLevels, setQualityLevels] = useState<{ height: number, level: number }[]>([]);
    const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 is Auto

    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Cinematic mode from global store
    const { cinematicMode, toggleCinematicMode } = useStore();

    // Initial HLS Setup
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let hls: Hls | null = null;

        if (Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                const levels = data.levels.map((level, index) => ({
                    height: level.height,
                    level: index
                })).sort((a, b) => b.height - a.height);
                setQualityLevels(levels);
            });

        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
        }

        // Expose hls instance to component scope via ref-like attachment if needed, 
        // but easier to store in a ref. 
        // For simplicity in this functional component, we can use a ref to store the hls instance 
        // or just access it via the video element if we attached it there (not standard)
        // Let's use a weak map or similar, or just attach to video for now as a quick hack
        // or better: utilize a ref for the HLS instance.
        (video as any).hls = hls;

        return () => {
            if (hls) {
                hls.destroy();
            }
        };
    }, [src]);

    // Setup preview video for frame thumbnails
    useEffect(() => {
        const previewVideo = previewVideoRef.current;
        if (!previewVideo) return;

        let hls: Hls | null = null;

        if (Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(previewVideo);
        } else if (previewVideo.canPlayType('application/vnd.apple.mpegurl')) {
            previewVideo.src = src;
        }

        // Mute and prevent autoplay
        previewVideo.muted = true;
        previewVideo.preload = 'metadata';

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
    }, [src]);

    // Video event handlers
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            // Update buffered
            if (video.buffered.length > 0) {
                setBuffered(video.buffered.end(video.buffered.length - 1));
            }
        };

        const handleWaiting = () => setIsLoading(true);
        const handleCanPlay = () => setIsLoading(false);
        const handlePlaying = () => {
            setIsPlaying(true);
            setIsLoading(false);
        };
        const handlePause = () => setIsPlaying(false);

        const handleEnded = () => {
            setIsPlaying(false);
            if (autoPlayNext && onEnded) {
                onEnded();
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
            if (autoPlay) {
                video.play().catch(() => {
                    // Autoplay prevented, user interaction required
                    setIsPlaying(false);
                });
            }
        };

        const handleDurationChange = () => {
            setDuration(video.duration);
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('waiting', handleWaiting);
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('playing', handlePlaying);
        video.addEventListener('pause', handlePause);
        video.addEventListener('ended', handleEnded);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('durationchange', handleDurationChange);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('waiting', handleWaiting);
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('playing', handlePlaying);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('ended', handleEnded);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('durationchange', handleDurationChange);
        };
    }, [autoPlay, autoPlayNext, onEnded]);

    // Fullscreen change listener
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

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
                case 'j':
                    e.preventDefault();
                    video.currentTime = Math.max(0, video.currentTime - 10);
                    break;
                case 'l':
                    e.preventDefault();
                    video.currentTime = Math.min(video.duration, video.currentTime + 10);
                    break;
                case ',':
                case '<':
                    e.preventDefault();
                    decreaseSpeed();
                    break;
                case '.':
                case '>':
                    e.preventDefault();
                    increaseSpeed();
                    break;
                case 't':
                    e.preventDefault();
                    toggleCinematicMode();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, isMuted]);

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

    // Playback speed controls
    const changeSpeed = useCallback((speed: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = speed;
            setPlaybackSpeed(speed);
            setShowSettings(false);
        }
    }, []);

    const increaseSpeed = useCallback(() => {
        const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackSpeed);
        if (currentIndex < PLAYBACK_SPEEDS.length - 1) {
            changeSpeed(PLAYBACK_SPEEDS[currentIndex + 1]);
        }
    }, [playbackSpeed, changeSpeed]);

    const decreaseSpeed = useCallback(() => {
        const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackSpeed);
        if (currentIndex > 0) {
            changeSpeed(PLAYBACK_SPEEDS[currentIndex - 1]);
        }
    }, [playbackSpeed, changeSpeed]);

    // Progress bar seeking
    const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const video = videoRef.current;
        const progress = progressRef.current;
        if (!video || !progress) return;

        const rect = progress.getBoundingClientRect();
        const clickPosition = (e.clientX - rect.left) / rect.width;
        const newTime = clickPosition * video.duration;
        video.currentTime = Math.max(0, Math.min(newTime, video.duration));
    }, []);

    const handleProgressHover = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const video = videoRef.current;
        const previewVideo = previewVideoRef.current;
        const previewCanvas = previewCanvasRef.current;
        const progress = progressRef.current;
        if (!video || !progress) return;

        const rect = progress.getBoundingClientRect();
        const hoverPos = (e.clientX - rect.left) / rect.width;
        const seekTime = hoverPos * video.duration;

        setHoverPosition(hoverPos * 100);
        setHoverTime(seekTime);

        // Capture preview frame
        if (previewVideo && previewCanvas && !isNaN(seekTime) && isFinite(seekTime)) {
            previewVideo.currentTime = seekTime;

            const captureFrame = () => {
                const ctx = previewCanvas.getContext('2d');
                if (ctx && previewVideo.readyState >= 2) {
                    // Set canvas size (thumbnail size)
                    previewCanvas.width = 160;
                    previewCanvas.height = 90;
                    ctx.drawImage(previewVideo, 0, 0, 160, 90);
                    setPreviewImage(previewCanvas.toDataURL('image/jpeg', 0.7));
                }
            };

            // Capture on seeked event
            previewVideo.onseeked = captureFrame;
        }
    }, []);

    const handleProgressLeave = useCallback(() => {
        setHoverTime(null);
        setPreviewImage(null);
    }, []);

    const changeQuality = (levelIndex: number) => {
        const hls = videoRef.current ? (videoRef.current as any)['hls'] as Hls : null;
        if (hls) {
            hls.currentLevel = levelIndex; // -1 for auto
            setCurrentQuality(levelIndex);
            setShowSettings(false);
        }
    };

    const renderSettingsMenu = () => {
        if (settingsView === 'main') {
            return (
                <div className="flex flex-col py-1">
                    <button
                        onClick={() => setSettingsView('speed')}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 flex items-center justify-between text-white transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Settings size={16} className="text-gray-400" />
                            <span>Playback Speed</span>
                        </div>
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                            {playbackSpeed === 1 ? 'Normal' : `${playbackSpeed}x`}
                            <span className="text-base leading-none">›</span>
                        </span>
                    </button>
                    {/* Ambient Mode Toggle */}
                    <button
                        onClick={() => setAmbientMode(!ambientMode)}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 flex items-center justify-between text-white transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <div className="i-lucide-sparkles w-4 h-4 text-gray-400" /> {/* Sparkles icon or just text */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
                            <span>Ambient Mode</span>
                        </div>
                        <div className={cn(
                            "w-8 h-4 rounded-full relative transition-colors duration-300",
                            ambientMode ? "bg-primary" : "bg-white/20"
                        )}>
                            <div className={cn(
                                "absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300",
                                ambientMode ? "translate-x-4" : "translate-x-0"
                            )} />
                        </div>
                    </button>
                    <button
                        onClick={() => setSettingsView('quality')}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 flex items-center justify-between text-white transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M2 12h10" /><path d="M9 4v16" /><path d="m3 9 3 3-3 3" /><path d="M12 6A20.56 20.56 0 0 0 20 12a21.5 21.5 0 0 0-8 6" /></svg>
                            <span>Quality</span>
                        </div>
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                            {currentQuality === -1 ? 'Auto' : `${qualityLevels.find(q => q.level === currentQuality)?.height}p`}
                            <span className="text-base leading-none">›</span>
                        </span>
                    </button>
                </div>
            );
        }

        if (settingsView === 'speed') {
            return (
                <>
                    <button
                        onClick={() => setSettingsView('main')}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 text-white border-b border-white/10 flex items-center gap-2 sticky top-0 bg-black/95 backdrop-blur z-10"
                    >
                        <span className="text-base leading-none">‹</span>
                        <span className="uppercase text-xs font-semibold text-gray-400">Back</span>
                    </button>
                    <div className="max-h-60 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-white/20">
                        {PLAYBACK_SPEEDS.map((speed) => (
                            <button
                                key={speed}
                                onClick={() => {
                                    changeSpeed(speed);
                                }}
                                className={cn(
                                    "w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center justify-between transition-colors",
                                    playbackSpeed === speed ? "text-primary font-medium" : "text-white"
                                )}
                            >
                                <span>{speed === 1 ? 'Normal' : `${speed}x`}</span>
                                {playbackSpeed === speed && <span className="text-primary text-xs">✓</span>}
                            </button>
                        ))}
                    </div>
                </>
            );
        }

        if (settingsView === 'quality') {
            return (
                <>
                    <button
                        onClick={() => setSettingsView('main')}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 text-white border-b border-white/10 flex items-center gap-2 sticky top-0 bg-black/95 backdrop-blur z-10"
                    >
                        <span className="text-base leading-none">‹</span>
                        <span className="uppercase text-xs font-semibold text-gray-400">Back</span>
                    </button>
                    <div className="max-h-60 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-white/20">
                        <button
                            onClick={() => changeQuality(-1)}
                            className={cn(
                                "w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center justify-between transition-colors",
                                currentQuality === -1 ? "text-primary font-medium" : "text-white"
                            )}
                        >
                            <span>Auto</span>
                            {currentQuality === -1 && <span className="text-primary text-xs">✓</span>}
                        </button>
                        {qualityLevels.map((q) => (
                            <button
                                key={q.level}
                                onClick={() => changeQuality(q.level)}
                                className={cn(
                                    "w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center justify-between transition-colors",
                                    currentQuality === q.level ? "text-primary font-medium" : "text-white"
                                )}
                            >
                                <span>{q.height}p</span>
                                {currentQuality === q.level && <span className="text-primary text-xs">✓</span>}
                            </button>
                        ))}
                    </div>
                </>
            );
        }
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const bufferedProgress = duration > 0 ? (buffered / duration) * 100 : 0;

    return (
        <div ref={containerRef} className={cn('relative group w-full aspect-video isolate', className)}>
            {/* Ambilight Background Layer */}
            <canvas
                ref={ambientRef}
                className={cn(
                    "absolute inset-0 w-full h-full -z-10 blur-3xl scale-105 transition-opacity duration-700",
                    ambientMode ? "opacity-50" : "opacity-0"
                )}
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
                    crossOrigin="anonymous"
                />

                {/* Hidden preview video for frame capture */}
                <video
                    ref={previewVideoRef}
                    className="hidden"
                    muted
                    preload="metadata"
                    crossOrigin="anonymous"
                />

                {/* Hidden canvas for frame capture */}
                <canvas ref={previewCanvasRef} className="hidden" />

                {/* Loading Spinner Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                        <div className="bg-black/50 p-4 rounded-full backdrop-blur-sm animate-in fade-in duration-200">
                            <Loader2 className="w-10 h-10 text-white animate-spin" />
                        </div>
                    </div>
                )}

                {/* Big Play Button (when paused and not loading) */}
                {!isPlaying && !isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 group/play">
                        <button
                            onClick={togglePlay}
                            className="bg-black/50 p-6 rounded-full backdrop-blur-sm text-white hover:bg-primary hover:text-white hover:scale-110 transition-all duration-300 group-hover/play:scale-105"
                        >
                            <Play fill="currentColor" size={32} className="ml-1" />
                        </button>
                    </div>
                )}

                {/* Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Progress Bar */}
                    <div
                        ref={progressRef}
                        className="relative h-1 mx-4 mb-2 cursor-pointer group/progress hover:h-1.5 transition-all"
                        onClick={handleProgressClick}
                        onMouseMove={handleProgressHover}
                        onMouseLeave={handleProgressLeave}
                    >
                        {/* Background */}
                        <div className="absolute inset-0 bg-white/30 rounded-full" />

                        {/* Buffered */}
                        <div
                            className="absolute inset-y-0 left-0 bg-white/50 rounded-full"
                            style={{ width: `${bufferedProgress}%` }}
                        />

                        {/* Progress */}
                        <div
                            className="absolute inset-y-0 left-0 bg-primary rounded-full"
                            style={{ width: `${progress}%` }}
                        />

                        {/* Seek Handle */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-md"
                            style={{ left: `calc(${progress}% - 6px)` }}
                        />

                        {/* Hover Preview & Time Tooltip */}
                        {hoverTime !== null && (
                            <div
                                className="absolute -translate-x-1/2 pointer-events-none flex flex-col items-center"
                                style={{ left: `${hoverPosition}%`, bottom: '100%', marginBottom: '8px' }}
                            >
                                {/* Frame Preview */}
                                {previewImage && (
                                    <div className="mb-1 rounded overflow-hidden border-2 border-white/20 shadow-lg">
                                        <img
                                            src={previewImage}
                                            alt="Preview"
                                            className="w-40 h-[90px] object-cover"
                                        />
                                    </div>
                                )}
                                {/* Time */}
                                <div className="px-2 py-1 bg-black/90 text-white text-xs rounded">
                                    {formatTime(hoverTime)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center gap-3 px-4 pb-3">
                        <button onClick={togglePlay} className="text-white hover:text-primary transition-transform hover:scale-110">
                            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                        </button>

                        <button onClick={toggleMute} className="text-white hover:text-primary transition-transform hover:scale-110">
                            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                        </button>

                        {/* Time Display */}
                        <div className="text-sm text-white font-medium tabular-nums">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>

                        <div className="flex-1" />

                        {/* Autoplay Toggle */}
                        <div className="flex items-center gap-2 group/autoplay relative">
                            <button
                                onClick={() => setAutoPlayNext(!autoPlayNext)}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <div className={cn(
                                    "w-8 h-4 rounded-full relative transition-colors duration-300",
                                    autoPlayNext ? "bg-primary" : "bg-white/30"
                                )}>
                                    <div className={cn(
                                        "absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300",
                                        autoPlayNext ? "translate-x-4" : "translate-x-0"
                                    )} />
                                </div>
                            </button>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-[10px] text-white rounded opacity-0 group-hover/autoplay:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                Autoplay is {autoPlayNext ? 'on' : 'off'}
                            </div>
                        </div>

                        {/* Settings Control */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowSettings(!showSettings);
                                    setSettingsView('main');
                                }}
                                className={cn(
                                    "text-white hover:text-primary transition-transform hover:scale-110 flex items-center gap-1",
                                    showSettings && "text-primary rotate-45"
                                )}
                            >
                                <Settings size={20} />
                            </button>

                            {/* Settings Menu */}
                            {showSettings && (
                                <div className="absolute bottom-full right-0 mb-4 bg-black/95 rounded-xl py-2 min-w-[200px] max-w-[250px] shadow-2xl border border-white/10 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                                    {renderSettingsMenu()}
                                </div>
                            )}
                        </div>

                        {/* Cinematic Mode Toggle */}
                        <button
                            onClick={toggleCinematicMode}
                            className={cn(
                                "text-white hover:text-primary transition-transform hover:scale-110",
                                cinematicMode && "text-primary"
                            )}
                            title="Theater mode (t)"
                        >
                            <RectangleHorizontal size={22} />
                        </button>

                        <button onClick={toggleFullscreen} className="text-white hover:text-primary transition-transform hover:scale-110">
                            {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

