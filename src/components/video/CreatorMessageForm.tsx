'use client';

import { useState } from 'react';
import { Send, MessageCircle, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { commentsApi } from '@/lib/api/interactions';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

interface CreatorMessageFormProps {
    videoId: string;
    channelName: string;
    className?: string;
}

export default function CreatorMessageForm({ videoId, channelName, className }: CreatorMessageFormProps) {
    const { user } = useStore();
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!message.trim() || loading) return;

        setLoading(true);
        setError(null);

        try {
            const response = await commentsApi.sendMessage(videoId, message.trim());
            if (response.success) {
                setSuccess(true);
                setMessage('');
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className={cn("bg-card/50 rounded-2xl p-6 border border-border/50 backdrop-blur-sm", className)}>
                <div className="flex items-center gap-3 mb-4">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    <h3 className="font-bold">Send a Message to {channelName}</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                    Sign in to send a private message to the creator.
                </p>
            </div>
        );
    }

    return (
        <div className={cn("bg-card/50 rounded-2xl p-6 border border-border/50 backdrop-blur-sm", className)}>
            <div className="flex items-center gap-3 mb-4">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h3 className="font-bold">Send a Message to {channelName}</h3>
            </div>

            <p className="text-muted-foreground text-sm mb-4">
                Your message will be sent privately to the creator.
            </p>

            <div className="space-y-4">
                <Textarea
                    placeholder="Write your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[100px] resize-none bg-secondary/50 border-border/50 focus:border-primary"
                    maxLength={2000}
                    disabled={loading || success}
                />

                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                        {message.length}/2000
                    </span>

                    <Button
                        onClick={handleSubmit}
                        disabled={!message.trim() || loading || success}
                        className={cn(
                            "rounded-full px-6 font-bold transition-all",
                            success && "bg-green-500 hover:bg-green-500"
                        )}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending...
                            </>
                        ) : success ? (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                Message Sent!
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Send Message
                            </>
                        )}
                    </Button>
                </div>

                {error && (
                    <p className="text-sm text-destructive">{error}</p>
                )}
            </div>
        </div>
    );
}
