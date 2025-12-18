'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useStore } from '@/store/useStore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const profileSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Invalid email address'),
    bio: z.string().max(500).optional(),
});

export default function SettingsPage() {
    const { user, updateProfile, uploadAvatar, isLoading, error, clearError } = useStore();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            bio: user?.bio || '',
        },
    });

    // Reset success message when form changes
    const onFormChange = () => {
        if (successMessage) setSuccessMessage(null);
        if (error) clearError();
    };

    async function onSubmit(values: z.infer<typeof profileSchema>) {
        setSuccessMessage(null);
        clearError();
        try {
            await updateProfile(values);
            setSuccessMessage('Profile updated successfully');
        } catch (error) {
            console.error('Update profile error:', error);
        }
    }

    async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        setSuccessMessage(null);
        clearError();

        // Basic validation
        if (file.size > 5 * 1024 * 1024) {
            // We should set an error state here manually if we had a way to clear it
            alert("File size must be less than 5MB");
            return;
        }

        try {
            await uploadAvatar(file);
            setSuccessMessage('Profile picture updated successfully');
        } catch (error) {
            console.error('Upload avatar error:', error);
        }
    }

    if (!user) return null;

    const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const baseUrl = NEXT_PUBLIC_API_URL.replace('/api', '');

    const avatarUrl = user.avatar
        ? (user.avatar.startsWith('http') ? user.avatar : `${baseUrl}${user.avatar}`)
        : null;

    return (
        <ProtectedRoute>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Settings</h1>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar navigation could go here */}
                    <div className="md:col-span-1">
                        <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
                            <nav className="flex flex-col">
                                <a href="#" className="flex items-center gap-3 px-4 py-3 bg-primary/5 text-primary font-medium border-l-4 border-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                    Account
                                </a>
                                <a href="#" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-secondary border-l-4 border-transparent">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                    Security (Coming Soon)
                                </a>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-3 space-y-6">
                        {/* Status Messages */}
                        {successMessage && (
                            <div className="bg-green-500/15 text-green-500 p-4 rounded-lg border border-green-500/30">
                                {successMessage}
                            </div>
                        )}
                        {error && (
                            <div className="bg-destructive/15 text-destructive p-4 rounded-lg border border-destructive/30">
                                {error}
                            </div>
                        )}

                        {/* Profile Picture */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Picture</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 rounded-full bg-secondary flex-shrink-0 overflow-hidden border-2 border-border">
                                        {avatarUrl ? (
                                            <img
                                                src={avatarUrl}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-2xl font-bold">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex gap-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={isLoading}
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                {isLoading ? 'Uploading...' : 'Change Picture'}
                                            </Button>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/jpeg,image/png,image/webp"
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            JPG, PNG or WEBp. Max size 5MB.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Profile Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} onChange={onFormChange} className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Full Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Your full name" {...field} disabled={isLoading} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email Address</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="email@example.com" {...field} disabled={isLoading} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="bio"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Bio</FormLabel>
                                                    <FormControl>
                                                        <textarea
                                                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                            placeholder="Tell us about yourself"
                                                            {...field}
                                                            disabled={isLoading}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div>
                                            <FormLabel className="text-muted-foreground">Username</FormLabel>
                                            <Input value={user.username} disabled className="mt-2 bg-secondary" />
                                            <p className="text-xs text-muted-foreground mt-1">Username cannot be changed.</p>
                                        </div>

                                        <div className="pt-4 flex justify-end">
                                            <Button type="submit" disabled={isLoading}>
                                                {isLoading ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
