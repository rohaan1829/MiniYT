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
import { Upload, X, FileVideo, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { videoApi } from '@/lib/api/videos';
import { apiClient } from '@/lib/api/client';
import { cn } from '@/lib/utils';

interface VideoUploadDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

export default function VideoUploadDialog({ isOpen, onClose, onSuccess }: VideoUploadDialogProps) {
    const [status, setStatus] = useState<UploadStatus>('idle');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [processingProgress, setProcessingProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [videoId, setVideoId] = useState<string | null>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

    const videoInputRef = useRef<HTMLInputElement>(null);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setStatus('idle');
                setUploadProgress(0);
                setProcessingProgress(0);
                setError(null);
                setVideoId(null);
                setTitle('');
                setDescription('');
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

        setStatus('uploading');
        setError(null);

        const formData = new FormData();
        formData.append('video', videoFile);
        formData.append('title', title);
        formData.append('description', description);
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
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] bg-background border-border rounded-3xl p-0 overflow-hidden shadow-2xl">
                <DialogHeader className="p-6 border-b border-border bg-secondary/30">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        {status === 'idle' ? 'Upload Video' : 'Uploading Your Video'}
                    </DialogTitle>
                </DialogHeader>

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
                                    <p className="text-sm text-muted-foreground mt-1">Your videos will be private until you publish them.</p>
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
                                    <label className="text-sm font-bold">Title (required)</label>
                                    <Input
                                        placeholder="Add a title that describes your video"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="rounded-xl bg-secondary/50 border-transparent focus:bg-background"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Description</label>
                                    <Textarea
                                        placeholder="Tell viewers about your video"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="rounded-xl bg-secondary/50 border-transparent focus:bg-background min-h-[100px] resize-none"
                                    />
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
                                        <span className="text-sm font-medium">{thumbnailFile ? thumbnailFile.name : 'Upload thumbnail'}</span>
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

                {status === 'idle' && (
                    <DialogFooter className="p-6 border-t border-border bg-secondary/10">
                        <Button variant="ghost" onClick={onClose} className="rounded-full px-8 font-bold">Cancel</Button>
                        <Button
                            disabled={!videoFile || !title}
                            onClick={handleUpload}
                            className="rounded-full px-10 font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        >
                            Upload Video
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
