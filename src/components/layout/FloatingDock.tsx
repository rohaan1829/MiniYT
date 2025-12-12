'use client';

import { Home, Compass, Radio, Users, History, PlaySquare, Clock, ThumbsUp, Flame, Search, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface DockItemProps {
    icon: React.ElementType;
    label: string;
}

const DockItem = ({ icon: Icon, label }: DockItemProps) => {
    return (
        <div className="group relative flex flex-col items-center justify-end px-2 pb-2 transition-all duration-300 hover:-translate-y-2">
            <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-[10px] px-2 py-1 rounded mb-1 whitespace-nowrap z-50 pointer-events-none">
                {label}
            </div>
            <Link href="#" className="p-3 bg-white/5 hover:bg-white/10 dark:bg-zinc-800/40 dark:hover:bg-zinc-700/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg transition-all duration-300 group-hover:scale-125 group-hover:shadow-primary/50">
                <Icon size={24} className="text-white group-hover:text-primary transition-colors" />
            </Link>
        </div>
    );
};

import { useStore } from '@/store/useStore';

// ...

export default function FloatingDock() {
    const { dockVisible } = useStore();

    if (!dockVisible) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="flex items-end gap-2 px-4 py-3 bg-black/40 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-2xl ring-1 ring-white/5">
                <DockItem icon={Home} label="Home" />
                <DockItem icon={Compass} label="Explore" />
                <DockItem icon={Radio} label="Live" />
                <div className="w-px h-8 bg-white/10 mx-1 self-center" />
                <DockItem icon={History} label="History" />
                <DockItem icon={PlaySquare} label="Library" />
                <DockItem icon={Flame} label="Trending" />
                <div className="w-px h-8 bg-white/10 mx-1 self-center" />
                <DockItem icon={Search} label="Search" />
            </div>
        </div>
    );
}
