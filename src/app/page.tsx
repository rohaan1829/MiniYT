'use client';

import { useEffect } from 'react';

import { ModeToggle } from '@/components/ui/mode-toggle';

import Sidebar from '@/components/layout/Sidebar';
import VideoGrid from '@/components/video/VideoGrid';
import HeroSection from '@/components/home/HeroSection';
import { Button } from '@/components/ui/button';
import { Bell, Search, Menu } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
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

      {/* Header */}
      <header className="flex items-center justify-between pl-6 pr-6 py-6 sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 h-24">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-muted-foreground hover:text-foreground">
            <Menu className="h-6 w-6" />
          </Button>

          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-black text-2xl border border-primary/50">
            V
          </div>
          <h1 className="text-3xl font-bold tracking-tight hidden md:block">miniYT</h1>
        </div>

        {/* Search Bar - Bringing back the visible search bar */}
        <div className="flex-1 max-w-2xl mx-8 hidden md:block">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
              <Search className="h-5 w-5" />
            </div>
            <Input
              type="search"
              placeholder="Search videos..."
              className="w-full pl-12 h-12 text-lg bg-secondary border-transparent focus:bg-background transition-all rounded-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />

          <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary md:hidden">
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary w-10 h-10">
            <Bell className="w-5 h-5" />
          </Button>
          {user ? (
            <Avatar className="h-10 w-10 border border-border">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
          ) : (
            <Link href="/login">
              <Button className="rounded-full px-8 h-10 text-base bg-primary text-primary-foreground hover:bg-primary/90">Sign In</Button>
            </Link>
          )}
        </div>
      </header>

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
