'use client';

import { useEffect } from 'react';
import LeftSidebar from '@/components/home/LeftSidebar';
import RightSidebar from '@/components/home/RightSidebar';
import HomeFeed from '@/components/home/HomeFeed';
import { useStore } from '@/store/useStore';

export default function Home() {
  // Ensure dock is hidden on home
  useEffect(() => {
    useStore.setState({ dockVisible: false, sidebarOpen: false });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Left Sidebar - Fixed */}
      <LeftSidebar />

      {/* Main Content Area - 3 Column Layout */}
      <div className="flex justify-center">
        {/* Spacer for left sidebar */}
        <div className="w-20 xl:w-72 shrink-0" />

        {/* Center Feed */}
        <main className="w-full max-w-[600px] min-h-screen border-x border-white/10">
          <HomeFeed />
        </main>

        {/* Right Sidebar - Fixed */}
        <RightSidebar />

        {/* Spacer for right sidebar */}
        <div className="w-80 xl:w-96 shrink-0 hidden lg:block" />
      </div>
    </div>
  );
}
