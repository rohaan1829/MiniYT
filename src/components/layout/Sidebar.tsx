'use client';

import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { Home, Compass, Radio, Users, History, PlaySquare, Clock, ThumbsUp, Flame } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    href?: string;
    isActive?: boolean;
    isOpen: boolean;
}

const SidebarItem = ({ icon: Icon, label, href = "#", isActive, isOpen }: SidebarItemProps) => {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center p-3 rounded-lg mb-1 transition-colors",
                isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                !isOpen && "justify-center"
            )}
        >
            <Icon size={20} className={cn(isActive && "text-primary")} />
            {isOpen && <span className="ml-4 font-medium text-sm">{label}</span>}
        </Link>
    );
};

export default function Sidebar() {
    const sidebarOpen = useStore((state) => state.sidebarOpen);
    const pathname = usePathname();
    const isWatchPage = pathname?.startsWith('/watch');

    return (
        <aside
            className={cn(
                "fixed left-0 top-24 bottom-0 z-40 bg-background/80 backdrop-blur-md border-r border-border transition-[width,transform] duration-300 overflow-y-auto hide-scrollbar",
                sidebarOpen
                    ? "w-64 px-4 py-4"
                    : "w-0 px-0 -translate-x-full border-none"
            )}
        >
            <div className="mb-6">
                <SidebarItem icon={Home} label="Home" href="/" isOpen={sidebarOpen} isActive={pathname === '/'} />
                <SidebarItem icon={Compass} label="Explore" href="/explore" isOpen={sidebarOpen} isActive={pathname === '/explore'} />
                <SidebarItem icon={Flame} label="Trending" href="/trending" isOpen={sidebarOpen} isActive={pathname === '/trending'} />
                <SidebarItem icon={Radio} label="Live" href="/live" isOpen={sidebarOpen} isActive={pathname === '/live'} />
                <div className="my-2 border-t border-border" />
                <SidebarItem icon={PlaySquare} label="Library" href="/library" isOpen={sidebarOpen} isActive={pathname === '/library'} />
                <SidebarItem icon={History} label="History" href="/history" isOpen={sidebarOpen} isActive={pathname === '/history'} />
            </div>

            <div className={cn("border-t border-gray-200 dark:border-gray-800 my-2", !sidebarOpen && "hidden")} />

            <div className="mb-6">
                {sidebarOpen && <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase">Library</h3>}
                <SidebarItem icon={History} label="History" isOpen={sidebarOpen} />
                <SidebarItem icon={PlaySquare} label="Your Videos" isOpen={sidebarOpen} />
                <SidebarItem icon={Clock} label="Watch Later" isOpen={sidebarOpen} />
                <SidebarItem icon={ThumbsUp} label="Liked Videos" isOpen={sidebarOpen} />
            </div>

            <div className={cn("border-t border-gray-200 dark:border-gray-800 my-2", !sidebarOpen && "hidden")} />

            <div className="mb-6">
                {sidebarOpen && <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase">Trending</h3>}
                <SidebarItem icon={Flame} label="Trending" isOpen={sidebarOpen} />
                <SidebarItem icon={Users} label="Community" isOpen={sidebarOpen} />
            </div>

        </aside>
    );
}
