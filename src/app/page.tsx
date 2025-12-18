'use client';

import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import VideoGrid from '@/components/video/VideoGrid';
import HeroSection from '@/components/home/HeroSection';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

export default function Home() {
  const { user, sidebarOpen, toggleSidebar } = useStore();

  // Ensure dock is hidden on home
  useEffect(() => {
    useStore.setState({ dockVisible: false });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground relative selection:bg-primary selection:text-white pb-32">
      {/* Ambient Glow Background - Keeping this as user didn't dislike it */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-20" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none opacity-20" />

      <Header />

      <Sidebar />

      <main
        className={cn(
          "px-4 md:px-8 pt-8 max-w-[1920px] mx-auto space-y-8 transition-[padding] duration-300",
          sidebarOpen ? "md:pl-72" : "md:pl-28"
        )}
      >
        {/* Brought back the Hero Section */}
        <HeroSection />

        <div>
          {/* Section Title */}
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full inline-block"></span>
            Recommended for You
          </h2>
          <VideoGrid />
        </div>
      </main>
    </div>
  );
}
