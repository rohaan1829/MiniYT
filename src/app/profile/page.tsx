'use client';

import { useStore } from '@/store/useStore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit2, Tv, Settings, BarChart3 } from 'lucide-react';
import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import FloatingDock from '@/components/layout/FloatingDock';
import PageContainer from '@/components/layout/PageContainer';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
    const { user, sidebarOpen } = useStore();
    const router = useRouter();

    useEffect(() => {
        useStore.setState({
            dockVisible: true,
            sidebarOpen: false
        });
    }, []);

    if (!user) return null;

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background text-foreground relative pb-32">
                <Header />
                <Sidebar />

                <PageContainer>
                    <div className="max-w-4xl mx-auto">
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
                                <h1 className="text-3xl font-black tracking-tight">Your Profile</h1>
                                <p className="text-muted-foreground">Manage your personal presence on MiniYT</p>
                            </div>
                        </div>

                        {/* Profile Header Card */}
                        <div className="bg-card/50 backdrop-blur-sm rounded-3xl shadow-2xl border border-border/50 p-8 mb-8 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />

                            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                <div className="w-32 h-32 rounded-full bg-secondary flex-shrink-0 overflow-hidden border-4 border-background shadow-2xl group-hover:scale-105 transition-transform duration-500">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:4001${user.avatar}`}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-4xl font-black">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 text-center md:text-left space-y-2">
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                        <h2 className="text-3xl font-black">{user.name || user.username}</h2>
                                        {user.channel && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 self-center">
                                                Creator
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-lg text-muted-foreground font-medium">@{user.username}</p>
                                    <p className="text-sm text-muted-foreground/80">{user.email}</p>

                                    <div className="flex gap-3 pt-4 justify-center md:justify-start">
                                        <Link href="/settings">
                                            <Button variant="outline" className="h-10 rounded-full px-6 gap-2 border-border/50 hover:bg-secondary">
                                                <Edit2 className="h-4 w-4" /> Edit Profile
                                            </Button>
                                        </Link>
                                        {user.channel ? (
                                            <Link href={`/channel/${user.channel.handle}`}>
                                                <Button className="h-10 rounded-full px-6 gap-2 bg-primary hover:bg-primary/90">
                                                    <Tv className="h-4 w-4 text-white" /> View Channel
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Link href="/channel/create">
                                                <Button className="h-10 rounded-full px-6 gap-2 bg-primary hover:bg-primary/90">
                                                    Create Channel
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-colors">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Account Status</h3>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
                                    </div>
                                    <div>
                                        <p className="font-bold">Active</p>
                                        <p className="text-xs text-muted-foreground">Safe and secure</p>
                                    </div>
                                </div>
                            </div>

                            {user.channel && (
                                <>
                                    <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-colors">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Channel</h3>
                                        <div>
                                            <p className="text-xl font-black">{user.channel.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.channel.subscriberCount} Subscribers</p>
                                        </div>
                                    </div>
                                    <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-colors flex flex-col gap-3">
                                        <Link href="/channel/settings" className="w-full">
                                            <Button variant="ghost" className="w-full justify-start h-12 rounded-xl gap-3 hover:bg-primary/5 hover:text-primary transition-all font-bold">
                                                <Settings className="h-5 w-5" /> Manage Channel
                                            </Button>
                                        </Link>
                                        <Link href="/channel/analytics" className="w-full">
                                            <Button variant="ghost" className="w-full justify-start h-12 rounded-xl gap-3 hover:bg-primary/5 hover:text-primary transition-all font-bold">
                                                <BarChart3 className="h-5 w-5" /> Channel Analytics
                                            </Button>
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </PageContainer>
                <FloatingDock />
            </div>
        </ProtectedRoute>
    );
}
