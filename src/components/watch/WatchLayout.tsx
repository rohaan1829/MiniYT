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
                    : "max-w-[1800px] px-4 lg:px-6",
                sidebarOpen ? "pl-72" : ""
            )}
        >
            {/* Flex container for layout */}
            <div
                className={cn(
                    "flex gap-6",
                    cinematicMode
                        ? "flex-col"
                        : "flex-col lg:flex-row"
                )}
            >
                {/* Video Player Section */}
                <div
                    className={cn(
                        "min-w-0 pr-2 pb-8", // Added bottom padding for spacing
                        cinematicMode ? "w-full" : "flex-1"
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
                            ? "w-full max-w-[1400px] mx-auto px-4 pb-20"
                            : "lg:w-[400px] xl:w-[450px] pl-1 pb-20"
                    )}
                >
                    {/* Header for Up Next section */}
                    <h3 className={cn(
                        "font-bold text-lg mb-4 py-2",
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

