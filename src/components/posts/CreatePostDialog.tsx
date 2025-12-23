'use client';

import { useState } from 'react';
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
import { Image as ImageIcon, Video as VideoIcon, Type, X, Upload, Globe, Users, Loader2 } from 'lucide-react';
import { postsApi } from '@/lib/api/posts';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CreatePostDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
    channelId: string;
}

export default function CreatePostDialog({ isOpen, onClose, onCreated, channelId }: CreatePostDialogProps) {
    const [type, setType] = useState<'TEXT' | 'IMAGE' | 'VIDEO'>('TEXT');
    const [content, setContent] = useState('');
    const [visibility, setVisibility] = useState('PUBLIC');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const clearFile = () => {
        setFile(null);
        setPreview(null);
    };

    const handleSubmit = async () => {
        if (!content && !file) return;

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('type', type);
            formData.append('content', content);
            formData.append('visibility', visibility);
            formData.append('channelId', channelId);
            if (file) {
                formData.append('media', file);
            }

            const response = await postsApi.createPost(formData);
            if (response.success) {
                onCreated();
                // Reset form
                setContent('');
                clearFile();
            }
        } catch (err) {
            console.error('Create post error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] bg-[#0f0f0f] border-white/10 p-0 overflow-hidden rounded-2xl shadow-2xl">
                <DialogHeader className="p-6 border-b border-white/5 bg-white/5">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        Create a Creator Post
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6">
                    <Tabs defaultValue="TEXT" onValueChange={(v) => setType(v as 'TEXT' | 'IMAGE' | 'VIDEO')} className="w-full">
                        <TabsList className="bg-white/5 p-1 rounded-xl mb-6 grid grid-cols-3">
                            <TabsTrigger value="TEXT" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold">
                                <Type className="w-4 h-4 mr-2" />
                                Text
                            </TabsTrigger>
                            <TabsTrigger value="IMAGE" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold">
                                <ImageIcon className="w-4 h-4 mr-2" />
                                Image
                            </TabsTrigger>
                            <TabsTrigger value="VIDEO" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold">
                                <VideoIcon className="w-4 h-4 mr-2" />
                                Video
                            </TabsTrigger>
                        </TabsList>

                        <div className="space-y-6">
                            <Textarea
                                placeholder={type === 'TEXT' ? "What's on your mind?" : "Add a caption..."}
                                className="min-h-[150px] bg-white/5 border-white/10 rounded-xl focus:ring-primary/20 resize-none text-base placeholder:text-muted-foreground/50"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />

                            {(type === 'IMAGE' || type === 'VIDEO') && (
                                <div className="space-y-4">
                                    {preview ? (
                                        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-inner group">
                                            {type === 'IMAGE' ? (
                                                <img src={preview} alt="Preview" className="w-full max-h-[300px] object-contain" />
                                            ) : (
                                                <video src={preview} className="w-full max-h-[300px] object-contain" controls />
                                            )}
                                            <button
                                                onClick={clearFile}
                                                className="absolute top-3 right-3 p-2 bg-black/60 rounded-full hover:bg-black/95 text-white transition-all scale-0 group-hover:scale-100 shadow-xl"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all group">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <div className="p-4 rounded-full bg-primary/10 mb-4 group-hover:scale-110 transition-transform">
                                                    <Upload className="w-8 h-8 text-primary" />
                                                </div>
                                                <p className="mb-2 text-sm font-bold text-foreground">
                                                    Click to upload {type.toLowerCase()}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {type === 'IMAGE' ? 'PNG, JPG or GIF (max. 10MB)' : 'MP4 or WEBM (max. 50MB)'}
                                                </p>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept={type === 'IMAGE' ? "image/*" : "video/*"}
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        {visibility === 'PUBLIC' ? <Globe className="w-4 h-4 text-primary" /> : <Users className="w-4 h-4 text-primary" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold">Visibility</span>
                                        <span className="text-xs text-muted-foreground">{visibility === 'PUBLIC' ? 'Everyone can see' : 'Subscribers only'}</span>
                                    </div>
                                </div>
                                <Select value={visibility} onValueChange={setVisibility}>
                                    <SelectTrigger className="w-[160px] bg-transparent border-white/10 rounded-xl font-bold">
                                        <SelectValue placeholder="Visibility" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-950 border-white/10">
                                        <SelectItem value="PUBLIC" className="font-medium focus:bg-white/5">Public</SelectItem>
                                        <SelectItem value="SUBSCRIBERS_ONLY" className="font-medium focus:bg-white/5">Subscribers Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </Tabs>
                </div>

                <DialogFooter className="p-6 bg-white/5 border-t border-white/5 flex items-center justify-end gap-3 sm:justify-end">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold hover:bg-white/5">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || (!content && !file)}
                        className="rounded-xl px-10 font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:scale-100"
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
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
