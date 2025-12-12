'use client';

import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { Home, Compass, Radio, Users, History, PlaySquare, Clock, ThumbsUp, Flame } from 'lucide-react';
import Link from 'next/link';

interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    isActive?: boolean;
    isOpen: boolean;
}

const SidebarItem = ({ icon: Icon, label, isActive, isOpen }: SidebarItemProps) => {
    return (
        <Link
            href="#"
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

    return (
        <aside
            className={cn(
                "fixed left-0 top-24 bottom-0 z-40 bg-background/80 backdrop-blur-md border-r border-border transition-[width] duration-300 overflow-y-auto hide-scrollbar",
                sidebarOpen ? "w-64 px-4 py-4" : "w-20 px-2 py-4"
            )}
        >
            <div className="mb-6">
                <SidebarItem icon={Home} label="Home" isActive isOpen={sidebarOpen} />
                <SidebarItem icon={Compass} label="Explore" isOpen={sidebarOpen} />
                <SidebarItem icon={Radio} label="Live" isOpen={sidebarOpen} />
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
