'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Camera, Image as ImageIcon, Check, ArrowLeft } from 'lucide-react';

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
import { Label } from '@/components/ui/label';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import PageContainer from '@/components/layout/PageContainer';
import FloatingDock from '@/components/layout/FloatingDock';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const channelSettingsSchema = z.object({
    name: z.string().min(3, 'Channel name must be at least 3 characters').max(50),
    description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
});

type ChannelSettingsValues = z.infer<typeof channelSettingsSchema>;

export default function ChannelSettingsPage() {
    const router = useRouter();
    const { user, updateChannel, uploadChannelAvatar, uploadChannelBanner, isLoading, sidebarOpen } = useStore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<ChannelSettingsValues>({
        resolver: zodResolver(channelSettingsSchema),
        defaultValues: {
            name: user?.channel?.name || '',
            description: user?.channel?.description || '',
        },
    });

    useEffect(() => {
        useStore.setState({
            dockVisible: true,
            sidebarOpen: false
        });

        if (user && !user.channel) {
            router.push('/channel/create');
        } else if (user?.channel) {
            form.reset({
                name: user.channel.name,
                description: user.channel.description || '',
            });
        }
    }, [user, router, form]);

    if (!user || !user.channel) {
        return null; // Or a loading state
    }

    async function onSubmit(data: ChannelSettingsValues) {
        setIsSubmitting(true);
        try {
            await updateChannel(user!.channel!.id, data);
            toast({
                title: "Settings updated",
                description: "Your channel information has been saved.",
            });
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Update failed",
                description: err.response?.data?.message || "Failed to update channel settings",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            await uploadChannelAvatar(user!.channel!.id, file);
            toast({
                title: "Avatar updated",
                description: "Your channel avatar has been changed.",
            });
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Upload failed",
                description: "Failed to upload avatar.",
            });
        }
    };

    const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            await uploadChannelBanner(user!.channel!.id, file);
            toast({
                title: "Banner updated",
                description: "Your channel banner has been changed.",
            });
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Upload failed",
                description: "Failed to upload banner.",
            });
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <Sidebar />
            <PageContainer>
                <div className="max-w-4xl mx-auto py-8 px-4">
                    <div className="flex items-center gap-4 mb-8">
                        <Link href={`/channel/${user.channel.handle}`}>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-3xl font-black tracking-tight">Channel customization</h1>
                            <p className="text-muted-foreground">Manage your channel details and branding</p>
                        </div>
                        <Link href="/channel/analytics">
                            <Button className="rounded-full gap-2 bg-secondary hover:bg-secondary/80 text-foreground border border-border/50 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
                                View Analytics
                            </Button>
                        </Link>
                    </div>

                    <div className="space-y-8">
                        {/* Branding Section */}
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                            <CardHeader>
                                <CardTitle>Branding</CardTitle>
                                <CardDescription>Your channel visuals</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                {/* Banner Upload */}
                                <div className="space-y-4">
                                    <Label className="text-sm font-medium">Banner Image</Label>
                                    <div
                                        className="relative w-full h-40 rounded-xl overflow-hidden bg-muted group cursor-pointer border-2 border-dashed border-border/50 hover:border-primary/50 transition-colors"
                                        onClick={() => bannerInputRef.current?.click()}
                                    >
                                        {user.channel.bannerUrl ? (
                                            <img src={user.channel.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ImageIcon className="h-10 w-10 text-muted-foreground opacity-20" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="flex flex-col items-center text-white">
                                                <Camera className="h-8 w-8 mb-2" />
                                                <span className="font-bold">Change Banner</span>
                                            </div>
                                        </div>
                                        <input
                                            type="file"
                                            ref={bannerInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleBannerChange}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        For the best results on all devices, use an image that's at least 2048 x 1152 pixels.
                                    </p>
                                </div>

                                {/* Avatar Upload */}
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                                        <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                                            <AvatarImage src={user.channel.avatarUrl} />
                                            <AvatarFallback className="text-4xl font-black text-primary bg-primary/10">
                                                {user.channel.name[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Camera className="h-8 w-8 text-white" />
                                        </div>
                                        <input
                                            type="file"
                                            ref={avatarInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                        />
                                    </div>
                                    <div className="space-y-2 text-center md:text-left">
                                        <div className="font-bold text-lg">Picture</div>
                                        <p className="text-sm text-muted-foreground max-w-sm">
                                            Your profile picture will appear where your channel is presented on YouTube, like next to your videos and comments.
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-full mt-2"
                                            onClick={() => avatarInputRef.current?.click()}
                                        >
                                            Change
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Basic Info Section */}
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Basic info</CardTitle>
                                <CardDescription>General details about your channel</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Channel name" {...field} />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Choose a channel name that represents you and your content.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Handle</Label>
                                            <div className="flex items-center gap-2">
                                                <div className="px-4 py-2 bg-muted rounded-md text-muted-foreground font-mono">
                                                    {user.channel?.handle}
                                                </div>
                                                <div className="p-2 text-green-500">
                                                    <Check className="h-4 w-4" />
                                                </div>
                                            </div>
                                            <FormDescription>
                                                Handles are unique and can't be changed once set.
                                            </FormDescription>
                                        </div>

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
                                                            rows={6}
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Descriptions tell viewers what your channel is about.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="pt-4 flex justify-end">
                                            <Button type="submit" className="rounded-full px-8 font-bold" disabled={isSubmitting}>
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    'Publish'
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </PageContainer>
            <FloatingDock />
        </div>
    );
}
