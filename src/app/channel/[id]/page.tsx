import { CHANNELS, VIDEOS } from '@/data/mockData';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import VideoCard from '@/components/video/VideoCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';

type Params = Promise<{ id: string }>;

export default async function ChannelPage({ params }: { params: Params }) {
    const { id } = await params;

    // Find channel from mock data, or mock one based on ID if not in list (for demo flexibility)
    let channel = CHANNELS.find((c) => c.id === id);

    // Fallback Mock if specific channel not found in the small mock list (since we linked from video cards that might not have deep mocks)
    if (!channel) {
        // Try to find a video that matches a channel name? Or just show a 404? 
        // For a better demo, let's gracefully fallback to a generic channel data if not found, 
        // or strictly 404. Let's strictly 404 for realism, but we need to ensure our Links use the right IDs.
        // Actually, our video cards don't link to channels yet. Let's assume we navigate via some other way.
        // For now, let's just 404 if not found in our dedicated list.
        if (id === '1') { // Hack for demo if needed
            channel = CHANNELS[0];
        } else {
            notFound();
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <Header />
            <Sidebar />

            <PageContainer>
                {/* Banner */}
                <div className="w-full h-48 md:h-64 lg:h-80 relative overflow-hidden bg-muted">
                    <img
                        src={channel.banner}
                        alt="Channel Banner"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                {/* Channel Header Info */}
                <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-10 flex flex-col md:flex-row items-start md:items-end gap-6 mb-8">
                    <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-xl">
                        <AvatarImage src={channel.avatar} />
                        <AvatarFallback>{channel.name[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 mb-2 md:mb-4">
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">{channel.name}</h1>
                        <div className="flex flex-col gap-1 text-muted-foreground font-medium">
                            <div className="flex items-center gap-2">
                                <span className="text-foreground">@{channel.id}</span>
                                <span>•</span>
                                <span>{channel.subscribers} subscribers</span>
                                <span>•</span>
                                <span>{channel.videos.length} videos</span>
                            </div>
                            <p className="max-w-2xl line-clamp-1 text-sm md:text-base">{channel.description}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mb-4 w-full md:w-auto">
                        <Button className="flex-1 md:flex-none rounded-full px-8 font-bold bg-white text-black hover:bg-gray-200 dark:bg-white dark:text-black dark:hover:bg-gray-200 h-10 text-base">
                            Subscribe
                        </Button>
                        <Button variant="secondary" size="icon" className="rounded-full h-10 w-10">
                            <Bell className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Tabs & Content */}
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <Tabs defaultValue="videos" className="w-full">
                        <TabsList className="bg-transparent border-b border-white/10 w-full justify-start h-auto p-0 rounded-none mb-8">
                            {['Home', 'Videos', 'Shorts', 'Live', 'Playlists', 'Community'].map((tab) => (
                                <TabsTrigger
                                    key={tab}
                                    value={tab.toLowerCase()}
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground px-6 py-3 font-semibold text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {tab}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent value="videos" className="mt-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                                {channel.videos.length > 0 ? (
                                    channel.videos.map((video) => (
                                        <VideoCard key={video.id} video={video} />
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 text-center text-muted-foreground">
                                        No videos uploaded yet.
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                        <TabsContent value="home" className="mt-0">
                            <div className="py-10 text-center text-muted-foreground">
                                Channel Home Layout coming soon...
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </PageContainer>
        </div>
    );
}
