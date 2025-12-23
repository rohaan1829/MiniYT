import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import VideoPlayerSection from '@/components/watch/VideoPlayerSection';
import RelatedVideos from '@/components/watch/RelatedVideos';
import FloatingDock from '@/components/layout/FloatingDock';
import WatchLayout from '@/components/watch/WatchLayout';
import Sidebar from '@/components/layout/Sidebar';
import { API_ROOT_URL } from '@/lib/api/client';

type Params = Promise<{ id: string }>;

async function getVideo(id: string) {
    try {
        const response = await fetch(`${API_ROOT_URL}/api/videos/${id}`, {
            cache: 'no-store'
        });
        const json = await response.json();
        return json.success ? json.data : null;
    } catch (error) {
        console.error('Failed to fetch video:', error);
        return null;
    }
}

async function getRelatedVideos() {
    try {
        const response = await fetch(`${API_ROOT_URL}/api/videos?limit=10`, {
            cache: 'no-store'
        });
        const json = await response.json();
        return json.success ? json.data : [];
    } catch (error) {
        return [];
    }
}

export default async function WatchPage({ params }: { params: Params }) {
    const { id } = await params;

    // Fetch code
    const [video, suggestedVideos] = await Promise.all([
        getVideo(id),
        getRelatedVideos()
    ]);

    if (!video) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background text-foreground bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
            <Header />
            <Sidebar />

            <WatchLayout sidebar={<RelatedVideos videos={suggestedVideos.filter((v: any) => v.id !== id)} />}>
                <VideoPlayerSection video={video} />
            </WatchLayout>

            <FloatingDock />
        </div>
    );
}

