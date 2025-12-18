'use client';

import { PlaySquare, Plus } from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import FloatingDock from '@/components/layout/FloatingDock';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { playlistApi } from '@/lib/api/playlists';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LibraryPage() {
    const { sidebarOpen } = useStore();
    const [mounted, setMounted] = useState(false);
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        useStore.setState({
            dockVisible: true,
            sidebarOpen: false
        });
        setMounted(true);
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        setIsLoading(true);
        try {
            const response = await playlistApi.getAll();
            if (response.success) {
                setPlaylists(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch playlists:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-background text-foreground relative pb-32">
            <Header />
            <Sidebar />
            <main
                className={cn(
                    "px-4 md:px-8 pt-8 max-w-[1920px] mx-auto space-y-6 transition-[padding] duration-300",
                    sidebarOpen ? "md:pl-72" : "md:pl-28"
                )}
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <PlaySquare className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold">Library</h1>
                    </div>
                    <Button className="w-full sm:w-auto gap-2">
                        <Plus className="w-4 h-4" />
                        New Playlist
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
                    {/* Fixed collections */}
                    <Link href="/history" className="group">
                        <div className="aspect-video bg-secondary rounded-xl flex items-center justify-center mb-3 group-hover:bg-secondary/80 transition-colors">
                            <PlaySquare className="w-10 h-10 opacity-50" />
                        </div>
                        <h3 className="font-semibold px-1">History</h3>
                    </Link>

                    <Link href="/library/liked" className="group">
                        <div className="aspect-video bg-secondary rounded-xl flex items-center justify-center mb-3 group-hover:bg-secondary/80 transition-colors">
                            <svg className="w-10 h-10 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" /></svg>
                        </div>
                        <h3 className="font-semibold px-1">Liked videos</h3>
                    </Link>

                    {/* Custom playlists */}
                    {!isLoading && playlists.map((playlist) => (
                        <Link key={playlist.id} href={`/playlist/${playlist.id}`} className="group">
                            <div className="aspect-video bg-secondary rounded-xl flex flex-col items-center justify-center mb-3 group-hover:bg-secondary/80 transition-colors relative overflow-hidden">
                                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                                    <span className="text-lg font-bold">{playlist._count?.videos || 0}</span>
                                    <PlaySquare className="w-5 h-5" />
                                </div>
                                <PlaySquare className="w-10 h-10 opacity-50" />
                            </div>
                            <h3 className="font-semibold px-1 line-clamp-1">{playlist.name}</h3>
                            <p className="text-xs text-muted-foreground px-1">{playlist.isPublic ? 'Public' : 'Private'} • Playlist</p>
                        </Link>
                    ))}
                </div>

                {!isLoading && playlists.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        <p className="text-sm">You haven't created any playlists yet.</p>
                    </div>
                )}
            </main>
            <FloatingDock />
        </div>
    );
}
