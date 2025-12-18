'use client';

import { useStore } from '@/store/useStore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProfilePage() {
    const { user } = useStore();

    if (!user) return null;

    return (
        <ProtectedRoute>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="bg-card rounded-xl shadow-sm border p-6 mb-6">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="w-24 h-24 rounded-full bg-secondary flex-shrink-0 overflow-hidden border-4 border-background shadow-sm">
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-2xl font-bold">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-2xl font-bold mb-1">{user.name || user.username}</h1>
                                <p className="text-muted-foreground mb-4">@{user.username}</p>
                                <p className="text-sm text-muted-foreground mb-4">{user.email}</p>

                                <div className="flex gap-3 justify-center md:justify-start">
                                    <Link href="/settings">
                                        <Button variant="outline" className="h-9">
                                            Edit Profile
                                        </Button>
                                    </Link>
                                    {!user.channel && (
                                        <Link href="/channel/create">
                                            <Button className="h-9 bg-primary hover:bg-primary/90">
                                                Create Channel
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats or Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-card rounded-xl shadow-sm border p-6">
                            <h3 className="font-semibold mb-2">Account Status</h3>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span className="text-sm text-muted-foreground">Active</span>
                            </div>
                        </div>

                        {user.channel && (
                            <div className="bg-card rounded-xl shadow-sm border p-6">
                                <h3 className="font-semibold mb-2">Channel Stats</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subscribers</span>
                                        <span className="font-medium">{user.channel.subscriberCount}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Videos</span>
                                        <span className="font-medium">0</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
