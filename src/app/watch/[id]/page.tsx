import { VIDEOS } from '@/data/mockData';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import VideoPlayerSection from '@/components/watch/VideoPlayerSection';
import RelatedVideos from '@/components/watch/RelatedVideos';
import FloatingDock from '@/components/layout/FloatingDock';

type Params = Promise<{ id: string }>;

export default async function WatchPage({ params }: { params: Params }) {
    const { id } = await params;
    const video = VIDEOS.find((v) => v.id === id);

    if (!video) {
        notFound();
    }



    // ...

    return (
        <div className="min-h-screen bg-background text-foreground bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
            <Header />

            <main className="max-w-[1800px] mx-auto pt-4 px-4 lg:px-6 flex flex-col lg:flex-row gap-6">
                {/* ... */}
                <div className="flex-1 min-w-0">
                    <VideoPlayerSection video={video} />
                </div>

                <div className="lg:w-[400px] xl:w-[450px] flex-shrink-0">
                    <RelatedVideos currentVideoId={video.id} />
                </div>
            </main>

            <FloatingDock />
        </div>
    );
}
