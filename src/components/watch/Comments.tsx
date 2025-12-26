'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { commentsApi } from '@/lib/api/interactions';
import { Loader2, Send, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Comments({ videoId }: { videoId: string }) {
    const { user } = useStore();
    const { toast } = useToast();
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!user) {
            toast({
                title: "Authentication required",
                description: "You must be signed in to send a message to the creator.",
                variant: "destructive"
            });
            return;
        }

        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            const response = await commentsApi.sendMessage(videoId, content.trim());
            if (response.success) {
                toast({
                    title: "Message Sent",
                    description: "Your message has been sent directly to the creator's inbox.",
                });
                setContent('');
            }
        } catch (error: any) {
            toast({
                title: "Failed to send",
                description: error.response?.data?.message || "Something went wrong while sending your message.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-8 border-t border-border pt-8">
            <div className="flex items-center gap-2 mb-6 text-primary">
                <ShieldCheck className="h-5 w-5" />
                <h3 className="text-xl font-bold">Private Message Creator</h3>
            </div>

            <p className="text-sm text-muted-foreground mb-6 bg-secondary/30 p-4 rounded-xl border border-border/50">
                Comments on this video are <strong>private messages</strong>. Your message will be sent directly to the creator's studio and will not be visible to the public.
            </p>

            <div className="flex gap-4">
                <Avatar className="w-10 h-10 border border-border">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>{(user?.name || user?.username || '?')[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                    <div className="relative">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Send a private message to the creator..."
                            className="w-full bg-secondary/50 border border-border rounded-2xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none text-sm"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="flex justify-end items-center gap-4">
                        {content.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                                {content.length} / 2000
                            </span>
                        )}
                        <Button
                            className="rounded-full px-8 gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                            disabled={isSubmitting || !content.trim()}
                            onClick={handleSubmit}
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Send Message
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
