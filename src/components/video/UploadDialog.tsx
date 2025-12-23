'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Upload,
    X,
    FileVideo,
    Image as ImageIcon,
    Loader2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { videoApi } from '@/lib/api/videos';

export interface UploadDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UploadDialog({ isOpen, onClose }: UploadDialogProps) {
    const [step, setStep] = useState<'pick' | 'details' | 'uploading' | 'success'>('pick');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const videoInputRef = useRef<HTMLInputElement>(null);
    const thumbInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const router = useRouter();

    const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type.startsWith('video/')) {
                setVideoFile(file);
                setTitle(file.name.replace(/\.[^/.]+$/, ""));
                setStep('details');
            } else {
                toast({
                    variant: "destructive",
                    title: "Invalid file type",
                    description: "Please select a valid video file.",
                });
            }
        }
    };

    const handleThumbSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!videoFile) return;

        setIsSubmitting(true);
        setStep('uploading');

        const formData = new FormData();
        formData.append('video', videoFile);
        formData.append('title', title);
        formData.append('description', description);
        if (thumbnailFile) {
            formData.append('thumbnail', thumbnailFile);
        }

        try {
            const response = await videoApi.upload(formData);
            setStep('success');
            toast({
                title: "Upload started!",
                description: "Your video is being processed. It will be live soon.",
            });
            router.refresh();
        } catch (error: any) {
            setStep('details');
            toast({
                variant: "destructive",
                title: "Upload failed",
                description: error.response?.data?.message || "Something went wrong during upload.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const reset = () => {
        setStep('pick');
        setVideoFile(null);
        setThumbnailFile(null);
        setThumbnailPreview(null);
        setTitle('');
        setDescription('');
        setUploadProgress(0);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[720px] p-0 overflow-hidden bg-background border-border/50 shadow-2xl">
                <DialogHeader className="p-6 border-b border-border/50">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        {step === 'pick' && 'Upload Video'}
                        {step === 'details' && 'Video Details'}
                        {step === 'uploading' && 'Uploading...'}
                        {step === 'success' && 'Upload Complete'}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-8">
                    {step === 'pick' && (
                        <div
                            className="border-2 border-dashed border-border/50 rounded-2xl p-12 flex flex-col items-center justify-center gap-6 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                            onClick={() => videoInputRef.current?.click()}
                        >
                            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Upload className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-semibold mb-1">Select video file to upload</p>
                                <p className="text-sm text-muted-foreground">Your videos will be private until you publish them.</p>
                            </div>
                            <Button className="rounded-full px-8">Select File</Button>
                            <input
                                type="file"
                                ref={videoInputRef}
                                className="hidden"
                                accept="video/*"
                                onChange={handleVideoSelect}
                            />
                        </div>
                    )}

                    {step === 'details' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Title</label>
                                    <Input
                                        placeholder="Add a title that describes your video"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="bg-secondary/50 border-transparent focus:bg-background h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Description</label>
                                    <Textarea
                                        placeholder="Tell viewers about your video"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="bg-secondary/50 border-transparent focus:bg-background min-h-[150px]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Thumbnail</label>
                                    <div
                                        className="aspect-video rounded-xl bg-secondary border border-border/50 overflow-hidden relative group cursor-pointer"
                                        onClick={() => thumbInputRef.current?.click()}
                                    >
                                        {thumbnailPreview ? (
                                            <img src={thumbnailPreview} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                                                <ImageIcon className="h-8 w-8" />
                                                <p className="text-xs font-medium">Click to upload</p>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-white text-sm font-bold">Change Thumbnail</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Select or upload a picture that shows what's in your video.</p>
                                    <input
                                        type="file"
                                        ref={thumbInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleThumbSelect}
                                    />
                                </div>

                                <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 flex items-start gap-3">
                                    <FileVideo className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold truncate">{videoFile?.name}</p>
                                        <p className="text-xs text-muted-foreground">{(videoFile!.size / (1024 * 1024)).toFixed(2)} MB</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'uploading' && (
                        <div className="flex flex-col items-center justify-center py-12 gap-8 text-center">
                            <div className="relative">
                                <Loader2 className="h-20 w-20 text-primary animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Upload className="h-8 w-8 text-primary" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-2">We're processing your video</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto">This might take a few moments depending on the file size. You can close this window, and we'll notify you when it's ready.</p>
                            </div>
                            <div className="w-full max-w-md space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span>Uploading...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="flex flex-col items-center justify-center py-12 gap-6 text-center">
                            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                                <CheckCircle2 className="h-12 w-12 text-green-500" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Successful Upload!</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto">Your video has been uploaded and is now being processed for optimal quality.</p>
                            </div>
                            <div className="flex gap-4">
                                <Button variant="outline" className="rounded-full" onClick={onClose}>Done</Button>
                                <Button className="rounded-full" onClick={reset}>Upload Another</Button>
                            </div>
                        </div>
                    )}
                </div>

                {step === 'details' && (
                    <div className="p-6 border-t border-border/50 flex justify-end gap-3">
                        <Button variant="ghost" className="rounded-full" onClick={reset}>Cancel</Button>
                        <Button className="rounded-full px-12" onClick={handleUpload} disabled={isSubmitting || !title}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Upload Video
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
