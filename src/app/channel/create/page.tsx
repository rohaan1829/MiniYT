'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Tv } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useStore } from '@/store/useStore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

const createChannelSchema = z.object({
    name: z.string().min(3, 'Channel name must be at least 3 characters').max(50),
    handle: z.string()
        .min(3, 'Handle must be at least 3 characters')
        .max(30, 'Handle must be less than 30 characters')
        .regex(/^@[a-zA-Z0-9_]+$/, 'Handle must start with @ and contain only letters, numbers, and underscores'),
    description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
});

type CreateChannelValues = z.infer<typeof createChannelSchema>;

export default function CreateChannelPage() {
    const router = useRouter();
    const { createChannel, user, isLoading } = useStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const form = useForm<CreateChannelValues>({
        resolver: zodResolver(createChannelSchema),
        defaultValues: {
            name: '',
            handle: '@',
            description: '',
        },
    });

    useEffect(() => {
        if (user?.channel) {
            router.push(`/channel/${user.channel.handle}`);
        }
    }, [user, router]);

    if (user?.channel) {
        return null;
    }

    async function onSubmit(data: CreateChannelValues) {
        if (!user) {
            router.push('/login');
            return;
        }

        setIsSubmitting(true);
        try {
            await createChannel(data);
            toast({
                title: "Channel created!",
                description: `Your channel ${data.name} has been created successfully.`,
            });
            router.push(`/channel/${data.handle}`);
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to create channel';
            toast({
                variant: "destructive",
                title: "Channel Creation Failed",
                description: message,
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground relative flex items-center justify-center p-4">
            {/* Ambient Glow Background */}
            <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-20" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none opacity-20" />

            <div className="w-full max-w-lg space-y-6 relative z-10">
                <div className="space-y-2 text-center">
                    <div className="flex justify-center">
                        <div className="p-4 rounded-full bg-primary/20 border border-primary/50">
                            <Tv className="h-10 w-10 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Create Your Channel</h1>
                    <p className="text-muted-foreground">Start your content creation journey</p>
                </div>

                <Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Channel Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Coding Tutorials" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                This is the name that will appear on your channel page.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="handle"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Handle</FormLabel>
                                            <FormControl>
                                                <Input placeholder="@codingtutorials" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                A unique identifier for your channel (must start with @).
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Tell viewers about your channel..."
                                                    className="resize-none"
                                                    rows={4}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Use this space to describe what your channel is about.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Channel'
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
