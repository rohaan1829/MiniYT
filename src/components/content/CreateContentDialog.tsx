'use client';

import { useState, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Image as ImageIcon,
    Video as VideoIcon,
    Type,
    X,
    Upload,
    Globe,
    Users,
    Loader2,
    FileImage,
    FileVideo,
    Sparkles
} from 'lucide-react';
import { postsApi } from '@/lib/api/posts';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

interface CreateContentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated?: () => void;
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB for post videos

export default function CreateContentDialog({ isOpen, onClose, onCreated }: CreateContentDialogProps) {
    const { user } = useStore();
    const [type, setType] = useState<'TEXT' | 'IMAGE' | 'VIDEO'>('TEXT');
    const [content, setContent] = useState('');
    const [visibility, setVisibility] = useState('PUBLIC');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setError(null);

        // Validate file size
        const maxSize = type === 'IMAGE' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
        if (selectedFile.size > maxSize) {
            setError(`File too large. Maximum size is ${type === 'IMAGE' ? '10MB' : '100MB'}`);
            return;
        }

        // Validate file type
        const isImage = selectedFile.type.startsWith('image/');
        const isVideo = selectedFile.type.startsWith('video/');

        if (type === 'IMAGE' && !isImage) {
            setError('Please select an image file');
            return;
        }
        if (type === 'VIDEO' && !isVideo) {
            setError('Please select a video file');
            return;
        }

        setFile(selectedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
    };

    const clearFile = () => {
        setFile(null);
        setPreview(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleTypeChange = (newType: 'TEXT' | 'IMAGE' | 'VIDEO') => {
        setType(newType);
        clearFile();
    };

    const resetForm = () => {
        setContent('');
        setType('TEXT');
        setVisibility('PUBLIC');
        clearFile();
        setUploadProgress(0);
        setError(null);
    };

    const handleSubmit = async () => {
        if (!content && !file) {
            setError('Please add some content or media');
            return;
        }

        if ((type === 'IMAGE' || type === 'VIDEO') && !file) {
            setError(`Please select ${type === 'IMAGE' ? 'an image' : 'a video'} to upload`);
            return;
        }

        if (!user?.channel) {
            setError('You need to create a channel first to post content');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('type', type);
            formData.append('content', content);
            formData.append('visibility', visibility);
            // channelId is optional now - backend will use user's channel
            if (file) {
                formData.append('media', file);
            }

            const response = await postsApi.createPost(formData);
            if (response.success) {
                resetForm();
                onCreated?.();
                onClose();
            }
        } catch (err: any) {
            console.error('Create post error:', err);
            setError(err.response?.data?.message || 'Failed to create post. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            resetForm();
            onClose();
        }
    };

    const canSubmit = (type === 'TEXT' && content.trim()) ||
                      ((type === 'IMAGE' || type === 'VIDEO') && file);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[650px] bg-[#0f0f0f] border-white/10 p-0 overflow-hidden rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
                <DialogHeader className="p-6 border-b border-white/5 bg-gradient-to-r from-primary/10 to-transparent shrink-0">
                    <DialogTitle className="text-xl font-bold flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/20">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        Create Content
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        Share updates with your community
                    </p>
                </DialogHeader>

                <div className="p-6 overflow-y-auto flex-1">
                    {/* Content Type Tabs */}
                    <Tabs value={type} onValueChange={(v) => handleTypeChange(v as 'TEXT' | 'IMAGE' | 'VIDEO')} className="w-full">
                        <TabsList className="bg-white/5 p-1.5 rounded-xl mb-6 grid grid-cols-3 gap-1">
                            <TabsTrigger
                                value="TEXT"
                                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white font-bold transition-all"
                            >
                                <Type className="w-4 h-4 mr-2" />
                                Text
                            </TabsTrigger>
                            <TabsTrigger
                                value="IMAGE"
                                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white font-bold transition-all"
                            >
                                <ImageIcon className="w-4 h-4 mr-2" />
                                Image
                            </TabsTrigger>
                            <TabsTrigger
                                value="VIDEO"
                                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white font-bold transition-all"
                            >
                                <VideoIcon className="w-4 h-4 mr-2" />
                                Video
                            </TabsTrigger>
                        </TabsList>

                        <div className="space-y-6">
                            {/* Text Content Area */}
                            <Textarea
                                placeholder={
                                    type === 'TEXT'
                                        ? "What's on your mind? Share your thoughts with your community..."
                                        : "Add a caption to your post..."
                                }
                                className="min-h-[120px] bg-white/5 border-white/10 rounded-xl focus:ring-primary/20 resize-none text-base placeholder:text-muted-foreground/50"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                maxLength={2000}
                            />

                            {/* Character count */}
                            <div className="text-xs text-muted-foreground text-right -mt-4">
                                {content.length}/2000
                            </div>

                            {/* Media Upload Area */}
                            {(type === 'IMAGE' || type === 'VIDEO') && (
                                <div className="space-y-4">
                                    {preview ? (
                                        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-inner group">
                                            {type === 'IMAGE' ? (
                                                <img
                                                    src={preview}
                                                    alt="Preview"
                                                    className="w-full max-h-[350px] object-contain"
                                                />
                                            ) : (
                                                <video
                                                    src={preview}
                                                    className="w-full max-h-[350px] object-contain"
                                                    controls
                                                />
                                            )}
                                            <button
                                                onClick={clearFile}
                                                className="absolute top-3 right-3 p-2 bg-black/70 rounded-full hover:bg-black/90 text-white transition-all shadow-xl"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>

                                            {/* File info */}
                                            <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/70 rounded-lg text-xs text-white/80">
                                                {file?.name} ({(file!.size / 1024 / 1024).toFixed(2)} MB)
                                            </div>
                                        </div>
                                    ) : (
                                        <label className={cn(
                                            "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all group",
                                            type === 'IMAGE'
                                                ? "border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 hover:border-orange-500/50"
                                                : "border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/50"
                                        )}>
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <div className={cn(
                                                    "p-4 rounded-full mb-4 group-hover:scale-110 transition-transform",
                                                    type === 'IMAGE'
                                                        ? "bg-gradient-to-br from-orange-500/20 to-amber-500/20"
                                                        : "bg-gradient-to-br from-blue-500/20 to-cyan-500/20"
                                                )}>
                                                    {type === 'IMAGE' ? (
                                                        <FileImage className={cn("w-8 h-8", type === 'IMAGE' ? "text-orange-400" : "text-blue-400")} />
                                                    ) : (
                                                        <FileVideo className="w-8 h-8 text-blue-400" />
                                                    )}
                                                </div>
                                                <p className="mb-2 text-sm font-bold text-foreground">
                                                    Click to upload {type.toLowerCase()}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {type === 'IMAGE'
                                                        ? 'PNG, JPG, GIF or WebP (max. 10MB)'
                                                        : 'MP4, WebM or MOV (max. 100MB)'}
                                                </p>
                                            </div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                className="hidden"
                                                accept={type === 'IMAGE' ? "image/*" : "video/*"}
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    )}
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Visibility Setting */}
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        {visibility === 'PUBLIC' ? (
                                            <Globe className="w-4 h-4 text-primary" />
                                        ) : (
                                            <Users className="w-4 h-4 text-primary" />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold">Visibility</span>
                                        <span className="text-xs text-muted-foreground">
                                            {visibility === 'PUBLIC' ? 'Everyone can see this post' : 'Only your subscribers can see'}
                                        </span>
                                    </div>
                                </div>
                                <Select value={visibility} onValueChange={setVisibility}>
                                    <SelectTrigger className="w-[160px] bg-transparent border-white/10 rounded-xl font-bold">
                                        <SelectValue placeholder="Visibility" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-950 border-white/10">
                                        <SelectItem value="PUBLIC" className="font-medium focus:bg-white/5">
                                            Public
                                        </SelectItem>
                                        <SelectItem value="SUBSCRIBERS_ONLY" className="font-medium focus:bg-white/5">
                                            Subscribers Only
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </Tabs>
                </div>

                <DialogFooter className="p-6 bg-white/5 border-t border-white/5 flex items-center justify-between gap-3 sm:justify-between shrink-0">
                    <p className="text-xs text-muted-foreground hidden sm:block">
                        Posting as <span className="font-bold text-foreground">{user?.channel?.name || user?.name}</span>
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="ghost"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="rounded-xl font-bold hover:bg-white/5"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !canSubmit}
                            className={cn(
                                "rounded-xl px-8 font-bold shadow-lg transition-all hover:scale-105 active:scale-95 disabled:scale-100",
                                type === 'TEXT' && "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600",
                                type === 'IMAGE' && "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600",
                                type === 'VIDEO' && "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                            )}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Posting...
                                </>
                            ) : (
                                'Post'
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
