'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useStore } from '@/store/useStore';
import { Upload, X, FileVideo, CheckCircle2, AlertCircle, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { videoApi } from '@/lib/api/videos';
import { apiClient } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';

interface VideoUploadDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

export default function VideoUploadDialog({ isOpen, onClose, onSuccess }: VideoUploadDialogProps) {
    const { setIsUploading, setUploadDialogOpen } = useStore();
    const [status, setStatus] = useState<UploadStatus>('idle');
    const [isMinimized, setIsMinimized] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [processingProgress, setProcessingProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [videoId, setVideoId] = useState<string | null>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('all');
    const [isMadeForKids, setIsMadeForKids] = useState<boolean | null>(null);
    const [tags, setTags] = useState('');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

    const videoInputRef = useRef<HTMLInputElement>(null);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (!isOpen && !isMinimized) {
            setTimeout(() => {
                setStatus('idle');
                setUploadProgress(0);
                setProcessingProgress(0);
                setError(null);
                setVideoId(null);
                setTitle('');
                setDescription('');
                setCategory('all');
                setIsMadeForKids(null);
                setTags('');
                setVideoFile(null);
                setThumbnailFile(null);
            }, 300);
        }
    }, [isOpen]);

    // Polling for processing progress
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (status === 'processing' && videoId) {
            interval = setInterval(async () => {
                try {
                    const response = await videoApi.getVideo(videoId);
                    if (response.success) {
                        const video = response.data;
                        setProcessingProgress(video.processingProgress || 0);
                        if (video.status === 'ready') {
                            setStatus('success');
                            setIsMinimized(false); // Re-open on success if minimized
                            setIsUploading(false);
                            clearInterval(interval);
                            onSuccess?.();
                        } else if (video.status === 'failed') {
                            setStatus('error');
                            setError(video.processingError || 'Processing failed');
                            clearInterval(interval);
                        }
                    }
                } catch (err) {
                    console.error('Polling error:', err);
                }
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [status, videoId]);

    const handleUpload = async () => {
        if (!videoFile || !title) return;

        setIsUploading(true);
        setStatus('uploading');
        setError(null);

        const formData = new FormData();
        formData.append('video', videoFile);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('isMadeForKids', String(isMadeForKids));
        formData.append('tags', tags);
        if (thumbnailFile) {
            formData.append('thumbnail', thumbnailFile);
        }

        try {
            const response = await apiClient.post('/videos/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || progressEvent.loaded));
                    setUploadProgress(progress);
                },
            });

            if (response.data.success) {
                setVideoId(response.data.data.id);
                setStatus('processing');
            } else {
                setStatus('error');
                setError(response.data.message || 'Upload failed');
            }
        } catch (err: any) {
            setStatus('error');
            setIsUploading(false);
            setError(err.response?.data?.message || 'Something went wrong during upload');
        }
    };

    const renderProgressBar = (progress: number, label: string, color: string) => (
        <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
                <span>{label}</span>
                <span>{progress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                <div
                    className={cn("h-full transition-all duration-300", color)}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[600px] bg-background border-border rounded-3xl p-0 overflow-hidden shadow-2xl">
                    <DialogHeader className="p-6 border-b border-border bg-secondary/30 relative">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            {status === 'idle' ? 'Upload Video' : 'Uploading Your Video'}
                        </DialogTitle>
                        {(status === 'uploading' || status === 'processing') && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-12 top-6 rounded-full hover:bg-white/10"
                                onClick={() => {
                                    setIsMinimized(true);
                                    onClose();
                                }}
                            >
                                <Minimize2 className="w-5 h-5 text-muted-foreground" />
                            </Button>
                        )}
                    </DialogHeader>

                    <div className="overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar">
                        <div className="p-6 space-y-6">
                            {status === 'idle' && (
                                <div className="space-y-6">
                                    <div
                                        onClick={() => videoInputRef.current?.click()}
                                        className="border-2 border-dashed border-border rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
                                    >
                                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Upload className="w-8 h-8 text-primary" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-lg">
                                                {videoFile ? videoFile.name : 'Select video file to upload'}
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-1">Upload high-quality videos up to 3GB in size.</p>
                                        </div>
                                        <input
                                            type="file"
                                            ref={videoInputRef}
                                            className="hidden"
                                            accept="video/*"
                                            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold flex justify-between">
                                                Title (required)
                                                <span className={cn("text-[10px]", title.length > 100 ? "text-destructive" : "text-muted-foreground")}>
                                                    {title.length}/100
                                                </span>
                                            </label>
                                            <Input
                                                placeholder="Add a title that describes your video"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                                                className="rounded-xl bg-secondary/50 border-transparent focus:bg-background"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold flex justify-between">
                                                Description
                                                <span className={cn("text-[10px]", description.length > 5000 ? "text-destructive" : "text-muted-foreground")}>
                                                    {description.length}/5000
                                                </span>
                                            </label>
                                            <Textarea
                                                placeholder="Tell viewers about your video"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value.slice(0, 5000))}
                                                className="rounded-xl bg-secondary/50 border-transparent focus:bg-background min-h-[100px] resize-none"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold flex justify-between">
                                                Tags (Keywords)
                                                <span className="text-[10px] text-muted-foreground">Separate with commas</span>
                                            </label>
                                            <Input
                                                placeholder="gaming, gameplay, react, tutorial"
                                                value={tags}
                                                onChange={(e) => setTags(e.target.value)}
                                                className="rounded-xl bg-secondary/50 border-transparent focus:bg-background"
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-sm font-bold flex justify-between items-center">
                                                Category (required)
                                                <span className="text-[10px] text-muted-foreground font-normal">Select the best fit for your video</span>
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {CATEGORIES.filter(cat => cat.id !== 'all').map((cat) => (
                                                    <Badge
                                                        key={cat.id}
                                                        variant={category === cat.id ? "default" : "secondary"}
                                                        className={cn(
                                                            "cursor-pointer px-4 py-1.5 rounded-full transition-all border-transparent",
                                                            category === cat.id
                                                                ? "bg-primary text-primary-foreground scale-105 shadow-md"
                                                                : "hover:bg-secondary/80 text-foreground"
                                                        )}
                                                        onClick={() => setCategory(cat.id)}
                                                    >
                                                        {cat.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4 p-4 rounded-2xl bg-secondary/20 border border-border/50">
                                            <div className="space-y-1">
                                                <label className="text-sm font-bold">Audience (required)</label>
                                                <p className="text-xs text-muted-foreground">Regardless of your location, you're legally required to comply with COPPA and other laws.</p>
                                            </div>
                                            <div className="flex gap-4">
                                                <Button
                                                    type="button"
                                                    variant={isMadeForKids === true ? "default" : "outline"}
                                                    className="flex-1 rounded-xl"
                                                    onClick={() => setIsMadeForKids(true)}
                                                >
                                                    Yes, made for kids
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={isMadeForKids === false ? "default" : "outline"}
                                                    className="flex-1 rounded-xl"
                                                    onClick={() => setIsMadeForKids(false)}
                                                >
                                                    No, not for kids
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold">Thumbnail</label>
                                            <div
                                                onClick={() => thumbnailInputRef.current?.click()}
                                                className="border border-border rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-secondary/50 transition-colors"
                                            >
                                                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                                                    {thumbnailFile ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Upload className="w-5 h-5 text-muted-foreground" />}
                                                </div>
                                                <span className="text-sm font-medium truncate max-w-[200px]">{thumbnailFile ? thumbnailFile.name : 'Upload thumbnail'}</span>
                                                <input
                                                    type="file"
                                                    ref={thumbnailInputRef}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(status === 'uploading' || status === 'processing') && (
                                <div className="py-10 space-y-8">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative">
                                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                                                <FileVideo className="w-10 h-10 text-primary animate-pulse" />
                                            </div>
                                            <div className="absolute -bottom-1 -right-1">
                                                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-xl font-bold">{status === 'uploading' ? 'Uploading...' : 'Processing...'}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {status === 'uploading'
                                                    ? 'We are pushing your video to our servers.'
                                                    : 'Almost done! We are optimizing your video for streaming.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {renderProgressBar(
                                            uploadProgress,
                                            'Upload Progress',
                                            status === 'uploading' ? 'bg-primary' : 'bg-green-500'
                                        )}

                                        {status === 'processing' && renderProgressBar(
                                            processingProgress,
                                            'Processing Progress',
                                            'bg-blue-500'
                                        )}
                                    </div>
                                </div>
                            )}

                            {status === 'success' && (
                                <div className="py-10 flex flex-col items-center gap-6">
                                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold">Upload Complete!</h3>
                                        <p className="text-muted-foreground mt-2">Your video has been processed and is now live.</p>
                                    </div>
                                    <Button onClick={onClose} className="rounded-full px-10 font-bold">
                                        Close
                                    </Button>
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="py-10 flex flex-col items-center gap-6">
                                    <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
                                        <AlertCircle className="w-12 h-12 text-destructive" />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold">Upload Failed</h3>
                                        <p className="text-destructive mt-2">{error}</p>
                                    </div>
                                    <Button onClick={() => setStatus('idle')} variant="outline" className="rounded-full px-10 font-bold">
                                        Try Again
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {status === 'idle' && (
                        <DialogFooter className="p-6 border-t border-border bg-secondary/10">
                            <Button variant="ghost" onClick={onClose} className="rounded-full px-8 font-bold">Cancel</Button>
                            <Button
                                disabled={!videoFile || !title || category === 'all' || isMadeForKids === null || title.length < 3 || status !== 'idle'}
                                onClick={handleUpload}
                                className="rounded-full px-10 font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            >
                                {status === 'idle' ? 'Upload Video' : 'Uploading...'}
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>

            {/* Minimized Progress Widget */}
            {isMinimized && (status === 'uploading' || status === 'processing') && (
                <div
                    className="fixed bottom-6 right-6 z-[100] w-80 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300 cursor-pointer"
                    onClick={() => {
                        setIsMinimized(false);
                        setUploadDialogOpen(true);
                    }}
                >
                    <div className="p-4 bg-secondary/30 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
                                <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                            </div>
                            <span className="text-sm font-bold truncate max-w-[150px]">{title || 'Uploading...'}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <Maximize2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            <span>{status === 'uploading' ? 'Uploading' : 'Processing'}</span>
                            <span>{status === 'uploading' ? uploadProgress : processingProgress}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                            <div
                                className={cn(
                                    "h-full transition-all duration-300",
                                    status === 'uploading' ? "bg-primary" : "bg-blue-500"
                                )}
                                style={{ width: `${status === 'uploading' ? uploadProgress : processingProgress}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
