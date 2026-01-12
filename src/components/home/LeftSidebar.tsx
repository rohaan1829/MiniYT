'use client';

import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { Home, Compass, Flame, Users, Radio, Settings, Mail, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface NavItemProps {
    icon: React.ElementType;
    label: string;
    href: string;
    isActive?: boolean;
}

const NavItem = ({ icon: Icon, label, href, isActive }: NavItemProps) => {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-full transition-all duration-200 group",
                isActive
                    ? "bg-white/10 font-bold"
                    : "hover:bg-white/5"
            )}
        >
            <Icon
                size={26}
                className={cn(
                    "transition-transform duration-200 group-hover:scale-110",
                    isActive && "text-foreground"
                )}
                strokeWidth={isActive ? 2.5 : 2}
            />
            <span className="text-xl hidden xl:block">{label}</span>
        </Link>
    );
};

export default function LeftSidebar() {
    const { user, isAuthenticated } = useStore();
    const pathname = usePathname();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

    const mainNavItems = [
        { icon: Home, label: 'Home', href: '/' },
        { icon: Compass, label: 'Explore', href: '/explore' },
        { icon: Flame, label: 'Trending', href: '/trending' },
        { icon: Radio, label: 'Live', href: '/live' },
    ];

    const authNavItems = [
        { icon: Users, label: 'Subscriptions', href: '/subscriptions' },
        { icon: Mail, label: 'Inbox', href: '/inbox' },
    ];

    const creatorNavItems = user?.channel ? [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    ] : [];

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-20 xl:w-72 flex flex-col border-r border-white/10 bg-background z-40">
            {/* Logo */}
            <div className="p-4 xl:px-6 pt-6">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-black text-xl shrink-0">
                        V
                    </div>
                    <span className="text-2xl font-bold hidden xl:block">miniYT</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 xl:px-4 py-4 space-y-1">
                {mainNavItems.map((item) => (
                    <NavItem
                        key={item.href}
                        icon={item.icon}
                        label={item.label}
                        href={item.href}
                        isActive={pathname === item.href}
                    />
                ))}

                {isAuthenticated && (
                    <>
                        <div className="h-px bg-white/10 my-3" />
                        {authNavItems.map((item) => (
                            <NavItem
                                key={item.href}
                                icon={item.icon}
                                label={item.label}
                                href={item.href}
                                isActive={pathname === item.href}
                            />
                        ))}
                        {creatorNavItems.map((item) => (
                            <NavItem
                                key={item.href}
                                icon={item.icon}
                                label={item.label}
                                href={item.href}
                                isActive={pathname === item.href}
                            />
                        ))}
                    </>
                )}

                {/* Post Button */}
                {isAuthenticated && user?.channel && (
                    <Link
                        href="#compose"
                        className="mt-4 flex items-center justify-center gap-3 w-full xl:w-auto bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-6 rounded-full transition-all duration-200 shadow-lg shadow-primary/25"
                    >
                        <span className="hidden xl:block">Post</span>
                        <span className="xl:hidden text-xl">+</span>
                    </Link>
                )}
            </nav>

            {/* User Profile at Bottom */}
            {isAuthenticated && user && (
                <Link
                    href="/profile"
                    className="p-4 xl:px-4 border-t border-white/10 flex items-center gap-3 hover:bg-white/5 transition-colors"
                >
                    <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={user.avatar || undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary font-bold">
                            {(user.name || user.username)?.[0]?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="hidden xl:block flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{user.name || user.username}</p>
                        {user.channel && (
                            <p className="text-sm text-muted-foreground truncate">@{user.channel.handle}</p>
                        )}
                    </div>
                </Link>
            )}
        </aside>
    );
}
