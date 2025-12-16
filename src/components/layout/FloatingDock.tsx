'use client';

import { Home, Compass, Radio, Users, History, PlaySquare, Clock, ThumbsUp, Flame, Search, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface DockItemProps {
    icon: React.ElementType;
    label: string;
    href: string;
    isActive?: boolean;
}

const DockItem = ({ icon: Icon, label, href, isActive }: DockItemProps) => {
    return (
        <div className="group relative flex flex-col items-center justify-end px-2 pb-2 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-[10px] px-2 py-1 rounded mb-1 whitespace-nowrap z-50 pointer-events-none">
                {label}
            </div>
            <Link
                href={href}
                className={cn(
                    "p-3 rounded-2xl border shadow-lg transition-all duration-300 group-hover:scale-110 hover:shadow-primary/50 backdrop-blur-md",
                    isActive
                        ? "bg-primary text-white border-primary shadow-primary/20 scale-105 -translate-y-1"
                        : "bg-white/5 hover:bg-white/10 dark:bg-zinc-800/40 dark:hover:bg-zinc-700/60 border-white/10 text-white"
                )}
            >
                <Icon size={24} className={cn("transition-colors", isActive ? "text-white" : "group-hover:text-primary")} />
            </Link>
        </div>
    );
};

import { useStore } from '@/store/useStore';
import { usePathname } from 'next/navigation';

export default function FloatingDock() {
    const { dockVisible, cinematicMode } = useStore();
    const pathname = usePathname();

    if (!dockVisible || cinematicMode) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300 max-w-[90vw] overflow-x-auto hide-scrollbar pt-16 px-2">
            <div className="flex items-end gap-2 px-4 pt-3 pb-2 bg-black/40 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-2xl ring-1 ring-white/5">
                <DockItem icon={Home} label="Home" href="/" isActive={pathname === '/'} />
                <DockItem icon={Compass} label="Explore" href="/explore" isActive={pathname === '/explore'} />
                <DockItem icon={Flame} label="Trending" href="/trending" isActive={pathname === '/trending'} />
                <div className="w-px h-8 bg-white/10 mx-1 self-center" />
                <DockItem icon={Radio} label="Live" href="/live" isActive={pathname === '/live'} />
                <DockItem icon={History} label="History" href="/history" isActive={pathname === '/history'} />
                <DockItem icon={PlaySquare} label="Library" href="/library" isActive={pathname === '/library'} />
                <div className="w-px h-8 bg-white/10 mx-1 self-center" />
                <DockItem icon={Search} label="Search" href="/results" isActive={pathname?.startsWith('/results')} />
            </div>
        </div>
    );
}
