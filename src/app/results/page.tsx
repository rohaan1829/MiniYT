import { VIDEOS } from '@/data/mockData';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import VideoCard from '@/components/video/VideoCard';
import { Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';

type Params = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function SearchPage({ searchParams }: { searchParams: Params }) {
    const resolvedSearchParams = await searchParams;
    const query = resolvedSearchParams.search_query as string || '';

    // Simple filter logic
    const results = VIDEOS.filter(video =>
        video.title.toLowerCase().includes(query.toLowerCase()) ||
        video.channelName.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <Header />
            <Sidebar />

            <PageContainer className="px-4 md:px-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl font-medium">
                        Search results for <span className="font-bold">"{query}"</span>
                    </h1>
                    <Button variant="ghost" className="gap-2">
                        <Filter className="w-5 h-5" /> Filters
                    </Button>
                </div>

                <div className="flex flex-col gap-4">
                    {results.length > 0 ? (
                        results.map((video) => (
                            <div key={video.id} className="flex flex-col md:flex-row gap-4 max-w-5xl">
                                {/* Horizontal Card Wrapper - we can reuse VideoCard but constrain width or refactor, 
                                    for now let's just use VideoCard as is but in a flex container? 
                                    Actually VideoCard is designed as a block. 
                                    Let's manually build a Horizontal Video Card here for search results standard look.
                                */}
                                <div className="relative aspect-video w-full md:w-[360px] flex-shrink-0 bg-black rounded-xl overflow-hidden">
                                    <a href={`/watch/${video.id}`} className="block w-full h-full">
                                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                                    </a>
                                    <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-white text-xs font-medium rounded">
                                        {video.duration}
                                    </span>
                                </div>
                                <div className="flex-1 py-1">
                                    <a href={`/watch/${video.id}`}>
                                        <h3 className="text-lg md:text-xl font-normal hover:text-primary transition-colors mb-1 line-clamp-2">{video.title}</h3>
                                    </a>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                                        <span>{video.views} views</span>
                                        <span>•</span>
                                        <span>{video.postedAt}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <img src={video.channelAvatar} className="w-6 h-6 rounded-full" />
                                        <a href={`/channel/${video.channelName.replace(/\s+/g, '-').toLowerCase()}`} className="text-xs md:text-sm text-muted-foreground hover:text-foreground">
                                            {video.channelName}
                                        </a>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-1 md:line-clamp-2">
                                        {video.description || "No description available."}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center text-muted-foreground">
                            No results found. Try different keywords.
                        </div>
                    )}
                </div>
            </PageContainer>
        </div>
    );
}
