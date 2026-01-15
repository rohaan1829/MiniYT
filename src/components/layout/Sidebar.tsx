'use client';

import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { LayoutGrid, Heart, PlusCircle, PlayCircle, Users, Monitor, ChevronRight, LogOut, Sparkles } from 'lucide-react';
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
                "relative flex items-center px-4 py-3.5 rounded-2xl mb-2 transition-all duration-300 group cursor-pointer overflow-hidden",
                isActive
                    ? "bg-gradient-to-r from-primary/20 via-primary/10 to-transparent text-primary shadow-lg shadow-primary/10"
                    : variant === 'danger'
                        ? "text-red-400 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-transparent"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gradient-to-r hover:from-gray-100 hover:to-transparent dark:hover:from-gray-800/50 dark:hover:to-transparent",
                !isOpen && "justify-center px-3"
            )}
            onClick={onClick}
        >
            {/* Glow effect for active state */}
            {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary via-primary to-primary/50 rounded-full shadow-lg shadow-primary/50" />
            )}

            {hasChevron && isOpen && (
                <ChevronRight size={14} className="mr-2 text-gray-300 dark:text-gray-600" />
            )}

            {/* Icon with gradient background when active */}
            <div className={cn(
                "relative flex items-center justify-center rounded-xl transition-all duration-300",
                isActive
                    ? "bg-gradient-to-br from-primary to-primary/80 text-white p-2.5 shadow-lg shadow-primary/30"
                    : "p-2.5 group-hover:bg-gray-100 dark:group-hover:bg-gray-800 group-hover:scale-110",
                variant === 'danger' && !isActive && "group-hover:bg-red-500/10"
            )}>
                <Icon size={20} className={cn(
                    "transition-all duration-300",
                    isActive && "text-white",
                    variant === 'danger' && "text-red-400"
                )} />
            </div>

            {isOpen && (
                <span className={cn(
                    "ml-4 font-semibold text-sm tracking-wide transition-all duration-300",
                    isActive
                        ? "text-primary"
                        : variant === 'danger'
                            ? "text-red-400"
                            : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200"
                )}>
                    {label}
                </span>
            )}

            {/* Hover shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
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
                "fixed left-0 top-16 md:top-24 bottom-0 z-40 transition-all duration-300 overflow-y-auto hide-scrollbar hidden md:flex flex-col",
                "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl",
                "border-r border-gray-200/50 dark:border-gray-800/50",
                sidebarOpen
                    ? "w-72 px-5 py-8"
                    : "w-0 px-0 -translate-x-full border-none"
            )}
        >
            {/* Decorative gradient blob */}
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-gradient-to-br from-primary/20 to-pink-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-10 w-40 h-40 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* MENU Section */}
            <div className="flex-1 relative z-10">
                {sidebarOpen && (
                    <div className="flex items-center gap-2 px-4 mb-6">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center shadow-lg shadow-primary/20">
                            <Sparkles size={14} className="text-white" />
                        </div>
                        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                            Menu
                        </h3>
                    </div>
                )}

                <div className="space-y-1">
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
            </div>

            {/* Action Section */}
            {isAuthenticated && sidebarOpen && (
                <div className="relative z-10 mt-auto pt-6">
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent mb-6" />
                    <div className="flex items-center gap-2 px-4 mb-4">
                        <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                            Action
                        </h3>
                    </div>
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

