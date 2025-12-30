import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Skeleton } from '@/components/ui/skeleton';

export default function WatchLoading() {
    return (
        <div className="min-h-screen bg-background text-foreground bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background animate-page-enter">
            <Header />
            <Sidebar />

            <div className="max-w-[1720px] mx-auto pt-24 pb-12 px-4 flex flex-col lg:flex-row gap-6">
                {/* Main Content Skeleton */}
                <div className="flex-1 space-y-4">
                    {/* Video Player Placeholder */}
                    <div className="aspect-video w-full rounded-2xl bg-muted animate-pulse" />

                    {/* Title Placeholder */}
                    <Skeleton className="h-8 w-[70%] mt-4" />

                    {/* Channel & Actions Placeholder */}
                    <div className="flex items-center justify-between gap-4 py-2">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-10 w-28 rounded-full ml-4" />
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="h-10 w-32 rounded-full" />
                            <Skeleton className="h-10 w-24 rounded-full" />
                        </div>
                    </div>

                    {/* Description Placeholder */}
                    <Skeleton className="h-24 w-full rounded-xl" />
                </div>

                {/* Sidebar Skeleton (Related Videos) */}
                <div className="w-full lg:w-[400px] flex-shrink-0 space-y-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="flex gap-2 h-24">
                            <Skeleton className="w-40 h-full rounded-lg" />
                            <div className="flex-1 space-y-2 py-1">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-[60%]" />
                                <Skeleton className="h-3 w-[40%]" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
