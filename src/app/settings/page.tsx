'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import FloatingDock from '@/components/layout/FloatingDock';
import PageContainer from '@/components/layout/PageContainer';
import { cn } from '@/lib/utils';

const profileSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Invalid email address'),
    bio: z.string().max(500).optional(),
});

const securitySchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'account' | 'security'>('account');
    const {
        user, updateProfile, uploadAvatar,
        changePassword, toggle2FA,
        fetchSessions, sessions, revokeSession,
        isLoading, error, clearError
    } = useStore();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        useStore.setState({
            dockVisible: true,
            sidebarOpen: false
        });
        if (activeTab === 'security') {
            fetchSessions();
        }
    }, [activeTab]);

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            bio: user?.bio || '',
        },
    });

    const securityForm = useForm<z.infer<typeof securitySchema>>({
        resolver: zodResolver(securitySchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
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

    async function onSecuritySubmit(values: z.infer<typeof securitySchema>) {
        setSuccessMessage(null);
        clearError();
        try {
            await changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword
            });
            setSuccessMessage('Password updated successfully');
            securityForm.reset();
        } catch (error) {
            console.error('Update password error:', error);
        }
    }

    async function handleToggle2FA() {
        setSuccessMessage(null);
        clearError();
        try {
            const newState = !user?.twoFactorEnabled;
            await toggle2FA(newState);
            setSuccessMessage(`Two-factor authentication ${newState ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error('Toggle 2FA error:', error);
        }
    }

    async function handleRevokeSession(sessionId: string) {
        try {
            await revokeSession(sessionId);
            setSuccessMessage('Session revoked successfully');
        } catch (error) {
            console.error('Revoke session error:', error);
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
            <div className="min-h-screen bg-background text-foreground relative pb-32">
                <Header />
                <Sidebar />

                <PageContainer className="px-4 md:px-8 pt-8 max-w-[1920px] mx-auto">
                    <div className="max-w-5xl mx-auto">
                        {/* Back Button & Title */}
                        <div className="flex items-center gap-4 mb-8">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.back()}
                                className="rounded-full hover:bg-secondary transition-colors"
                            >
                                <ArrowLeft className="h-6 w-6" />
                            </Button>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight">Settings</h1>
                                <p className="text-muted-foreground">Manage your account preferences and security</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {/* Sidebar navigation */}
                            <div className="md:col-span-1">
                                <div className="bg-card/50 backdrop-blur-sm rounded-2xl shadow-sm border border-border/50 overflow-hidden sticky top-24">
                                    <nav className="flex flex-col p-2 gap-1">
                                        <button
                                            onClick={() => setActiveTab('account')}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold",
                                                activeTab === 'account'
                                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                            )}
                                        >
                                            <User size={18} />
                                            Account
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('security')}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold",
                                                activeTab === 'security'
                                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                            )}
                                        >
                                            <Shield size={18} />
                                            Security
                                        </button>
                                    </nav>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="md:col-span-3 space-y-6">
                                {/* Status Messages */}
                                {successMessage && (
                                    <div className="bg-green-500/10 text-green-500 p-4 rounded-xl border border-green-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                        <CheckCircle2 className="h-5 w-5" />
                                        <p className="text-sm font-medium">{successMessage}</p>
                                    </div>
                                )}
                                {error && (
                                    <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                        <AlertCircle className="h-5 w-5" />
                                        <p className="text-sm font-medium">{error}</p>
                                    </div>
                                )}

                                {activeTab === 'account' ? (
                                    <>
                                        {/* Profile Picture */}
                                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl">
                                            <CardHeader>
                                                <CardTitle className="text-xl font-bold">Profile Picture</CardTitle>
                                                <CardDescription>Update your public avatar</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center gap-8">
                                                    <div className="relative group">
                                                        <div className="w-28 h-28 rounded-full bg-secondary flex-shrink-0 overflow-hidden border-4 border-background shadow-2xl group-hover:scale-105 transition-transform duration-500">
                                                            {avatarUrl ? (
                                                                <img
                                                                    src={avatarUrl}
                                                                    alt={user.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-3xl font-black">
                                                                    {user.username.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => fileInputRef.current?.click()}
                                                            className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                                                        </button>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="flex gap-3">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="rounded-full px-6 border-border/50 hover:bg-secondary"
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
                                                        <p className="text-xs text-muted-foreground">
                                                            Recommended: JPG, PNG or WEBP. Max size 5MB.
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Profile Info */}
                                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl">
                                            <CardHeader>
                                                <CardTitle className="text-xl font-bold">Personal Information</CardTitle>
                                                <CardDescription>Tell the community about yourself</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <Form {...form}>
                                                    <form onSubmit={form.handleSubmit(onSubmit)} onChange={onFormChange} className="space-y-6">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <FormField
                                                                control={form.control}
                                                                name="name"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel className="font-bold">Full Name</FormLabel>
                                                                        <FormControl>
                                                                            <Input placeholder="Your full name" {...field} disabled={isLoading} className="bg-background/50 rounded-xl" />
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
                                                                        <FormLabel className="font-bold">Email Address</FormLabel>
                                                                        <FormControl>
                                                                            <Input placeholder="email@example.com" {...field} disabled={isLoading} className="bg-background/50 rounded-xl" />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>

                                                        <FormField
                                                            control={form.control}
                                                            name="bio"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="font-bold">Bio</FormLabel>
                                                                    <FormControl>
                                                                        <textarea
                                                                            className="flex min-h-[120px] w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                                            placeholder="Tell us about yourself"
                                                                            {...field}
                                                                            disabled={isLoading}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <div className="p-4 bg-secondary/30 rounded-xl border border-border/50">
                                                            <Label className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Username (Read-only)</Label>
                                                            <p className="mt-1 font-mono font-bold text-primary">@{user.username}</p>
                                                        </div>

                                                        <div className="pt-4 flex justify-end">
                                                            <Button type="submit" disabled={isLoading} className="rounded-full px-8 font-bold h-11">
                                                                {isLoading ? 'Saving...' : 'Save Changes'}
                                                            </Button>
                                                        </div>
                                                    </form>
                                                </Form>
                                            </CardContent>
                                        </Card>
                                    </>
                                ) : (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                        {/* Security Tab Content */}
                                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl">
                                            <CardHeader>
                                                <CardTitle className="text-xl font-bold">Security Settings</CardTitle>
                                                <CardDescription>Manage your password and protection</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                <Form {...securityForm}>
                                                    <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <FormField
                                                                control={securityForm.control}
                                                                name="currentPassword"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel className="font-bold">Current Password</FormLabel>
                                                                        <FormControl>
                                                                            <Input type="password" placeholder="••••••••" className="bg-background/50 rounded-xl" {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={securityForm.control}
                                                                name="newPassword"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel className="font-bold">New Password</FormLabel>
                                                                        <FormControl>
                                                                            <Input type="password" placeholder="••••••••" className="bg-background/50 rounded-xl" {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={securityForm.control}
                                                                name="confirmPassword"
                                                                render={({ field }) => (
                                                                    <FormItem className="md:col-span-2">
                                                                        <FormLabel className="font-bold">Confirm New Password</FormLabel>
                                                                        <FormControl>
                                                                            <Input type="password" placeholder="••••••••" className="bg-background/50 rounded-xl" {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>
                                                        <div className="flex justify-end">
                                                            <Button type="submit" disabled={isLoading} className="rounded-full px-6">
                                                                {isLoading ? 'Updating...' : 'Update Password'}
                                                            </Button>
                                                        </div>
                                                    </form>
                                                </Form>

                                                <div className="h-px bg-border/50 w-full" />

                                                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                                    <div>
                                                        <p className="font-bold text-primary">Two-Factor Authentication</p>
                                                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                                                    </div>
                                                    <Button
                                                        variant={user?.twoFactorEnabled ? "default" : "secondary"}
                                                        onClick={handleToggle2FA}
                                                        className="rounded-full transition-all"
                                                        disabled={isLoading}
                                                    >
                                                        {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl">
                                            <CardHeader>
                                                <CardTitle className="text-xl font-bold">Active Sessions</CardTitle>
                                                <CardDescription>Devices currently logged into your account</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    {sessions.length === 0 ? (
                                                        <p className="text-center py-4 text-muted-foreground">No active sessions found.</p>
                                                    ) : (
                                                        sessions.map((session) => (
                                                            <div key={session.id} className="flex items-center justify-between p-4 hover:bg-secondary/10 transition-colors rounded-xl border border-transparent">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="p-3 bg-secondary/30 rounded-full">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><rect width="14" height="20" x="5" y="2" rx="2" /><path d="M12 18h.01" /></svg>
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold">{session.sessionToken.substring(0, 8)}...</p>
                                                                        <p className="text-xs text-muted-foreground">Expires {new Date(session.expires).toLocaleDateString()}</p>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRevokeSession(session.id)}
                                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                                                                    disabled={isLoading}
                                                                >
                                                                    Revoke
                                                                </Button>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </PageContainer>
                <FloatingDock />
            </div>
        </ProtectedRoute>
    );
}
