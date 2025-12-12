'use client';

import { Menu, Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/store/useStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { ModeToggle } from '@/components/ui/mode-toggle';

import { useEffect, useState } from 'react';

import { usePathname } from 'next/navigation';

export default function Header() {
    const { toggleSidebar, toggleDock, user } = useStore();
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    const isWatchPage = pathname?.startsWith('/watch');

    const handleMenuClick = () => {
        if (isWatchPage) {
            toggleDock();
        } else {
            toggleSidebar();
        }
    };

    return (
        <header className="flex items-center justify-between pl-6 pr-6 py-6 sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 h-24">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={handleMenuClick} className="text-muted-foreground hover:text-foreground">
                    <Menu className="h-6 w-6" />
                </Button>

                <Link href="/" className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-black text-2xl border border-primary/50">
                        V
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight hidden md:block">miniYT</h1>
                </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8 hidden md:block">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const query = formData.get('q');
                        if (query) {
                            window.location.href = `/results?search_query=${encodeURIComponent(query.toString())}`;
                        }
                    }}
                    className="relative group"
                >
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                        <Search className="h-5 w-5" />
                    </div>
                    <Input
                        name="q"
                        type="search"
                        placeholder="Search videos..."
                        className="w-full pl-12 h-12 text-lg bg-secondary border-transparent focus:bg-background transition-all rounded-full"
                    />
                </form>
            </div>

            <div className="flex items-center gap-4">
                {mounted && <ModeToggle />}

                <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary md:hidden">
                    <Search className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary w-10 h-10">
                    <Bell className="w-5 h-5" />
                </Button>
                {/* Prevent hydration mismatch by only rendering user state on client if crucial, but actually Button mismatch is from Dropdown likely. 
                    However, `ModeToggle` uses Dropdown. Let's suppress hydration warning on the buttons just in case or ensure it works.
                    Actually, the easiest fix for Radix ID mismatch is to use `dynamic` import OR standard client mount check.
                 */}
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
    );
}
