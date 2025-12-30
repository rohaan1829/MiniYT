import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import PageContainer from '@/components/layout/PageContainer';
import { Skeleton } from '@/components/ui/skeleton';

export default function ResultsLoading() {
    return (
        <div className="min-h-screen bg-background text-foreground animate-page-enter">
            <Header />
            <Sidebar />

            <PageContainer className="px-4 md:px-8 max-w-7xl mx-auto py-8">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-2xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    {/* Video Skeletons */}
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex flex-col md:flex-row gap-4 max-w-5xl">
                            {/* Thumbnail */}
                            <div className="relative aspect-video w-full md:w-[360px] flex-shrink-0 bg-muted rounded-xl animate-pulse" />

                            {/* Info */}
                            <div className="flex-1 py-1 space-y-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-full" />
                                    <Skeleton className="h-6 w-[80%]" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-32" />
                                    <span>•</span>
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-6 w-6 rounded-full" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-3 w-[60%]" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </PageContainer>
        </div>
    );
}
