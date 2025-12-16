import { VIDEOS } from '@/data/mockData';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import VideoPlayerSection from '@/components/watch/VideoPlayerSection';
import RelatedVideos from '@/components/watch/RelatedVideos';
import FloatingDock from '@/components/layout/FloatingDock';
import WatchLayout from '@/components/watch/WatchLayout';

import Sidebar from '@/components/layout/Sidebar';

type Params = Promise<{ id: string }>;

export default async function WatchPage({ params }: { params: Params }) {
    const { id } = await params;
    const video = VIDEOS.find((v) => v.id === id);

    if (!video) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background text-foreground bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
            <Header />
            <Sidebar />

            <WatchLayout sidebar={<RelatedVideos currentVideoId={video.id} />}>
                <VideoPlayerSection video={video} />
            </WatchLayout>

            <FloatingDock />
        </div>
    );
}

