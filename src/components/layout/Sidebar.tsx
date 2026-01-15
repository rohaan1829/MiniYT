'use client';

import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { LayoutGrid, Heart, PlusCircle, PlayCircle, Users, Monitor, ChevronRight, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    href?: string;
    isActive?: boolean;
    isOpen: boolean;
    hasChevron?: boolean;
    onClick?: () => void;
    variant?: 'default' | 'danger';
}

const SidebarItem = ({ icon: Icon, label, href = "#", isActive, isOpen, hasChevron, onClick, variant = 'default' }: SidebarItemProps) => {
    const content = (
        <div
            className={cn(
                "flex items-center p-4 rounded-xl mb-2 transition-all duration-200 group cursor-pointer",
                isActive
                    ? "bg-primary/10 text-primary"
                    : variant === 'danger'
                        ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                        : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
                !isOpen && "justify-center"
            )}
            onClick={onClick}
        >
            {hasChevron && isOpen && (
                <ChevronRight size={16} className="mr-2 text-gray-300" />
            )}
            <Icon size={22} className={cn(
                "transition-transform duration-200 group-hover:scale-110",
                isActive && "text-primary",
                variant === 'danger' && "text-red-500"
            )} />
            {isOpen && (
                <span className={cn(
                    "ml-4 font-medium text-sm transition-all duration-200",
                    isActive ? "text-primary" : variant === 'danger' ? "text-red-500" : "text-gray-400"
                )}>
                    {label}
                </span>
            )}
        </div>
    );

    if (onClick) {
        return content;
    }

    return <Link href={href}>{content}</Link>;
};

export default function Sidebar() {
    const { sidebarOpen, isAuthenticated, user, logout } = useStore();
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <aside
            className={cn(
                "fixed left-0 top-24 bottom-0 z-40 bg-background/80 backdrop-blur-md border-r border-border transition-[width,transform] duration-300 overflow-y-auto hide-scrollbar flex flex-col",
                sidebarOpen
                    ? "w-64 px-4 py-6"
                    : "w-0 px-0 -translate-x-full border-none"
            )}
        >
            {/* MENU Section */}
            <div className="flex-1">
                {sidebarOpen && (
                    <h3 className="px-4 mb-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Menu
                    </h3>
                )}
                <SidebarItem icon={LayoutGrid} label="Home" href="/" isOpen={sidebarOpen} isActive={pathname === '/'} />
                <SidebarItem icon={Heart} label="Subscription" href="/subscriptions" isOpen={sidebarOpen} isActive={pathname === '/subscriptions'} />
                {isAuthenticated && user?.channel && (
                    <>
                        <SidebarItem icon={PlusCircle} label="Upload" href="/upload" isOpen={sidebarOpen} isActive={pathname === '/upload'} />
                        <SidebarItem icon={PlayCircle} label="Videos" href="/videos" isOpen={sidebarOpen} isActive={pathname === '/videos'} />
                    </>
                )}
                <SidebarItem icon={Users} label="Community" href="/community" isOpen={sidebarOpen} isActive={pathname === '/community'} />
                {isAuthenticated && user?.channel && (
                    <SidebarItem icon={Monitor} label="Channel" href={`/channel/${user.channel.id}`} isOpen={sidebarOpen} isActive={pathname?.startsWith('/channel/' + user.channel.id)} hasChevron />
                )}
            </div>

            {/* Action Section */}
            {isAuthenticated && sidebarOpen && (
                <div className="mt-auto pt-4 border-t border-border">
                    <h3 className="px-4 mb-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Action
                    </h3>
                    <SidebarItem
                        icon={LogOut}
                        label="Log Out"
                        isOpen={sidebarOpen}
                        variant="danger"
                        onClick={handleLogout}
                    />
                </div>
            )}
        </aside>
    );
}
