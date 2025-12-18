'use client';

import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface WatchLayoutProps {
    children: React.ReactNode;
    sidebar: React.ReactNode;
}

export default function WatchLayout({ children, sidebar }: WatchLayoutProps) {
    const { cinematicMode, setCinematicMode, sidebarOpen } = useStore();

    // Reset cinematic mode when leaving, ensuring dock/sidebar state on mount
    useEffect(() => {
        useStore.setState({
            dockVisible: true,
            sidebarOpen: false
        });

        return () => {
            setCinematicMode(false);
        };
    }, [setCinematicMode]);

    return (
        <main
            className={cn(
                "mx-auto pt-4 transition-[padding] duration-300",
                cinematicMode
                    ? "max-w-full px-0"
                    : "max-w-[1800px] px-4 lg:px-6 lg:h-[calc(100vh-6rem)] lg:overflow-hidden",
                // Sidebar padding logic. When Sidebar is open, push content. When closed (on watch), it's hidden so no extra padding needed besides container.
                sidebarOpen ? "pl-72" : ""
            )}
        >
            {/* Flex container for layout */}
            <div
                className={cn(
                    "flex gap-6",
                    cinematicMode
                        ? "flex-col"
                        : "flex-col lg:flex-row h-full"
                )}
            >
                {/* Video Player Section */}
                <div
                    className={cn(
                        "min-w-0 pr-2", // Added padding right for scrollbar spacing
                        cinematicMode ? "w-full" : "flex-1 lg:h-full lg:overflow-y-auto"
                    )}
                >
                    <div className={cn(
                        cinematicMode && "[&_.video-player-wrapper]:max-h-[calc(100vh-120px)]"
                    )}>
                        {children}
                    </div>
                </div>

                {/* Related Videos Sidebar */}
                <div
                    className={cn(
                        "flex-shrink-0",
                        cinematicMode
                            ? "w-full max-w-[1400px] mx-auto px-4"
                            : "lg:w-[400px] xl:w-[450px] lg:h-full lg:overflow-y-auto pl-1" // Added scrollable sidebar
                    )}
                >
                    {/* Header for Up Next section */}
                    <h3 className={cn(
                        "font-bold text-lg mb-4 sticky top-0 bg-background/95 backdrop-blur z-10 py-2", // made sticky
                        cinematicMode ? "block" : "hidden lg:block"
                    )}>
                        Up Next
                    </h3>

                    {/* Sidebar content */}
                    <div className={cn(
                        cinematicMode && "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    )}>
                        {sidebar}
                    </div>
                </div>
            </div>
        </main>
    );
}

