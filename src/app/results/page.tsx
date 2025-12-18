import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Filter, Search, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/PageContainer';
import { formatViews, formatTimeAgo, formatDuration } from '@/lib/formatters';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

type Params = Promise<{ [key: string]: string | string[] | undefined }>;

// Simple Channel Result Component
const ChannelResult = ({ channel }: { channel: any }) => (
    <div className="flex items-center gap-4 py-8 border-b border-border/50 max-w-5xl">
        <div className="w-[360px] flex-shrink-0 flex justify-center">
            <Link href={`/channel/${channel.handle}`}>
                <div className="relative group">
                    <Avatar className="w-32 h-32 md:w-40 md:h-40 hover:opacity-90 transition-opacity border-4 border-background shadow-xl">
                        <AvatarImage src={channel.avatarUrl} />
                        <AvatarFallback className="text-4xl">{channel.name[0]}</AvatarFallback>
                    </Avatar>
                    {channel.verified && (
                        <div className="absolute bottom-2 right-2 bg-primary text-primary-foreground p-1 rounded-full border-2 border-background">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                        </div>
                    )}
                </div>
            </Link>
        </div>
        <div className="flex-1">
            <Link href={`/channel/${channel.handle}`}>
                <h3 className="text-xl md:text-2xl font-medium hover:text-primary transition-colors cursor-pointer mb-1">{channel.name}</h3>
            </Link>
            <div className="text-sm text-muted-foreground flex items-center gap-2 mb-3">
                <span className="font-medium text-foreground/80">{channel.handle}</span>
                <span>•</span>
                <span>{channel.subscriberCount ? `${(channel.subscriberCount / 1000).toFixed(1)}K` : '0'} subscribers</span>
                <span>•</span>
                <span>{channel.videoCount || 0} videos</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 max-w-xl mb-4">
                {channel.description || "No description available."}
            </p>
            <Button className="rounded-full px-8 bg-foreground text-background hover:bg-foreground/90 transition-all active:scale-95">
                Subscribe
            </Button>
        </div>
    </div>
);

export default async function SearchPage({ searchParams }: { searchParams: Params }) {
    const resolvedSearchParams = await searchParams;
    const query = resolvedSearchParams.search_query as string || '';

    let results = { videos: [], channels: [] };

    try {
        // Use 4001 to match the current running environment
        const response = await fetch(`http://localhost:4001/api/search?q=${encodeURIComponent(query)}`, {
            cache: 'no-store'
        });
        const json = await response.json();
        if (json.success) {
            results = json.data;
        }
    } catch (error) {
        console.error('Search fetch failed:', error);
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <Header />
            <Sidebar />

            <PageContainer className="px-4 md:px-8 max-w-7xl mx-auto py-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-secondary rounded-2xl">
                            <Search className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Results for "{query}"
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Found {results.videos.length} videos and {results.channels.length} channels
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" className="gap-2 rounded-xl">
                        <Filter className="w-4 h-4" /> Filters
                    </Button>
                </div>

                <div className="flex flex-col gap-2">
                    {/* Channel Results */}
                    {results.channels.map((channel: any) => (
                        <ChannelResult key={channel.id} channel={channel} />
                    ))}

                    {/* Videos Divider if channels exist */}
                    {results.channels.length > 0 && results.videos.length > 0 && (
                        <div className="py-6 flex items-center gap-4">
                            <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Videos</span>
                            <div className="flex-1 h-px bg-border/50" />
                        </div>
                    )}

                    {/* Video Results */}
                    {results.videos.length > 0 ? (
                        <div className="flex flex-col gap-4 mt-2">
                            {results.videos.map((video: any) => {
                                const isDirectMatch = video.title.toLowerCase().includes(query.toLowerCase()) ||
                                    video.description?.toLowerCase().includes(query.toLowerCase());

                                return (
                                    <div key={video.id} className="flex flex-col md:flex-row gap-4 max-w-5xl group p-2 rounded-2xl hover:bg-secondary/30 transition-colors">
                                        <div className="relative aspect-video w-full md:w-[360px] flex-shrink-0 bg-black rounded-xl overflow-hidden shadow-sm">
                                            <Link href={`/watch/${video.id}`} className="block w-full h-full">
                                                <img
                                                    src={video.thumbnailUrl}
                                                    alt={video.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                            </Link>
                                            <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-[10px] font-bold rounded">
                                                {formatDuration(video.duration)}
                                            </span>
                                            {!isDirectMatch && (
                                                <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary/90 text-primary-foreground text-[10px] font-bold rounded-full flex items-center gap-1 shadow-lg">
                                                    <Tv className="w-3 h-3" /> Related
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 py-1">
                                            <Link href={`/watch/${video.id}`}>
                                                <h3 className="text-lg md:text-xl font-semibold leading-tight hover:text-primary transition-colors mb-1.5 line-clamp-2">{video.title}</h3>
                                            </Link>
                                            <div className="text-xs md:text-sm text-muted-foreground flex items-center gap-1.5 mb-4">
                                                <span className="font-medium text-foreground/70">{formatViews(video.views)} views</span>
                                                <span>•</span>
                                                <span>{formatTimeAgo(video.createdAt)}</span>
                                            </div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <Avatar className="w-6 h-6 border border-border">
                                                    <AvatarImage src={video.user?.channel?.avatarUrl} />
                                                    <AvatarFallback>{(video.user?.channel?.name || video.user?.name || '?')[0]}</AvatarFallback>
                                                </Avatar>
                                                <Link
                                                    href={`/channel/${video.user?.channel?.handle || '#'}`}
                                                    className="text-xs md:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    {video.user?.channel?.name || video.user?.name}
                                                </Link>
                                                {video.user?.channel?.verified && (
                                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-muted-foreground"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-1 md:line-clamp-2 leading-relaxed">
                                                {video.description || "No description available."}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        results.channels.length === 0 && (
                            <div className="py-24 flex flex-col items-center justify-center text-center">
                                <div className="p-6 bg-secondary rounded-full mb-6">
                                    <Search className="w-12 h-12 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">No results found</h3>
                                <p className="text-muted-foreground max-w-sm">
                                    Try different keywords or check your spelling for <span className="text-foreground font-semibold italic">"{query}"</span>.
                                </p>
                                <Button variant="outline" className="mt-8 rounded-full px-8" asChild>
                                    <Link href="/">Back to Home</Link>
                                </Button>
                            </div>
                        )
                    )}
                </div>
            </PageContainer>
        </div>
    );
}
