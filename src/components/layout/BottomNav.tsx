'use client';

import { Home, Users, Clapperboard, PlaySquare, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';

export default function BottomNav() {
    const pathname = usePathname();
    const { user } = useStore();

    // Hide on auth pages
    if (pathname === '/login' || pathname === '/register') {
        return null;
    }

    const navItems = [
        { icon: Home, label: 'Home', href: '/' },
        { icon: Users, label: 'Community', href: '/community' },
        { icon: Clapperboard, label: 'Subs', href: '/subscriptions' },
        { icon: PlaySquare, label: 'Videos', href: '/videos' },
        { icon: User, label: 'You', href: user ? '/profile' : '/login' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50 md:hidden pb-safe">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors relative group",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <div className={cn(
                                "transition-transform duration-300",
                                isActive && "scale-110"
                            )}>
                                <Icon size={24} />
                            </div>
                            <span className="text-[10px] font-medium leading-none">
                                {item.label}
                            </span>

                            {isActive && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full shadow-[0_0_8px_rgba(255,255,255,0.3)] dark:shadow-[0_0_8px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-top-1 duration-300" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
