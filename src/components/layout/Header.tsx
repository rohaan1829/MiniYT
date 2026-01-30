'use client';

import { Menu, Search, Bell, LogOut, User as UserIcon, Settings, Tv, ChevronDown, Video, Loader2, Plus, Image as ImageIcon, Type, PenSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/store/useStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { ModeToggle } from '@/components/ui/mode-toggle';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { searchApi } from '@/lib/api/search';
import { cn } from '@/lib/utils';
import { History, TrendingUp } from 'lucide-react';
import VideoUploadDialog from '@/components/video/VideoUploadDialog';
import CreateContentDialog from '@/components/content/CreateContentDialog';
import NotificationBell from './NotificationBell';

export default function Header() {
    const { toggleSidebar, toggleDock, user, logout, isUploading, uploadDialogOpen, setUploadDialogOpen, contentDialogOpen, setContentDialogOpen } = useStore();
    const [mounted, setMounted] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const router = useRouter();

    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // ... (keep previous useEffects)

    const isWatchPage = pathname?.startsWith('/watch');

    const handleMenuClick = () => {
        toggleSidebar();
    };

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <header className={cn(
            "flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 h-16 md:h-24 transition-all duration-300",
            isMobileSearchOpen && "h-16"
        )}>
            {/* Standard Header View */}
            {!isMobileSearchOpen ? (
                <>
                    <div className="flex items-center gap-2 md:gap-4">
                        <Button variant="ghost" size="icon" onClick={handleMenuClick} className="text-muted-foreground hover:text-foreground hidden md:flex">
                            <Menu className="h-6 w-6" />
                        </Button>

                        <Link href="/" className="flex items-center gap-2 md:gap-3">
                            <div className="w-8 h-8 md:w-12 md:h-12 bg-primary/20 rounded-lg md:rounded-xl flex items-center justify-center text-primary font-black text-lg md:text-2xl border border-primary/50 shrink-0">
                                V
                            </div>
                            <h1 className="text-xl md:text-3xl font-bold tracking-tight hidden sm:block">Yiddishtishel</h1>
                        </Link>
                    </div>

                    {/* Desktop Search Bar */}
                    <div className="flex-1 max-w-2xl mx-4 md:mx-8 hidden md:block" ref={searchRef}>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (searchQuery) {
                                    router.push(`/results?search_query=${encodeURIComponent(searchQuery)}`);
                                    setShowSuggestions(false);
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
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                className="w-full pl-12 h-10 md:h-12 text-sm md:text-lg bg-secondary border-transparent focus:bg-background transition-all rounded-full"
                                autoComplete="off"
                            />

                            {/* Suggestions Dropdown */}
                            {showSuggestions && (suggestions.length > 0 || searchQuery.length >= 2) && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-2xl shadow-2xl py-2 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {suggestions.length > 0 ? (
                                        suggestions.map((suggestion, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left"
                                                onClick={() => {
                                                    setSearchQuery(suggestion.text);
                                                    router.push(`/results?search_query=${encodeURIComponent(suggestion.text)}`);
                                                    setShowSuggestions(false);
                                                }}
                                            >
                                                {suggestion.type === 'channel' ? (
                                                    <Tv className="h-4 w-4 text-primary" />
                                                ) : (
                                                    <Search className="h-4 w-4 text-muted-foreground" />
                                                )}
                                                <span className="flex-1 truncate font-medium">{suggestion.text}</span>
                                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground px-1.5 py-0.5 bg-secondary rounded">
                                                    {suggestion.type}
                                                </span>
                                            </button>
                                        ))
                                    ) : searchQuery.length >= 2 && (
                                        <button
                                            type="submit"
                                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left font-medium"
                                        >
                                            <Search className="h-4 w-4 text-muted-foreground" />
                                            <span>Search for "{searchQuery}"</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </form>
                    </div>

                    <div className="flex items-center gap-1 md:gap-4">
                        {mounted && <ModeToggle />}

                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-secondary md:hidden"
                            onClick={() => setIsMobileSearchOpen(true)}
                        >
                            <Search className="w-5 h-5" />
                        </Button>

                        <div className="hidden sm:block">
                            <NotificationBell />
                        </div>

                        {user && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "rounded-full w-8 h-8 md:w-10 md:h-10 transition-colors",
                                            isUploading ? "text-primary cursor-not-allowed opacity-50" : "hover:bg-secondary"
                                        )}
                                        title={isUploading ? "Upload in progress..." : "Create"}
                                        disabled={isUploading}
                                    >
                                        {isUploading ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <Plus className="w-5 h-5 md:w-6 md:h-6" />}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 bg-popover/95 backdrop-blur-xl border-white/10">
                                    <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">Create</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <DropdownMenuItem
                                        onClick={() => setUploadDialogOpen(true)}
                                        className="flex items-center gap-3 py-3 cursor-pointer focus:bg-white/5"
                                    >
                                        <div className="p-2 rounded-lg bg-gradient-to-br from-red-500/20 to-pink-500/20">
                                            <Video className="w-4 h-4 text-red-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Upload Video</p>
                                            <p className="text-xs text-muted-foreground">Share a video with HLS streaming</p>
                                        </div>
                                    </DropdownMenuItem>
                                    {user.channel && (
                                        <DropdownMenuItem
                                            onClick={() => setContentDialogOpen(true)}
                                            className="flex items-center gap-3 py-3 cursor-pointer focus:bg-white/5"
                                        >
                                            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                                                <PenSquare className="w-4 h-4 text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Create Post</p>
                                                <p className="text-xs text-muted-foreground">Share text, images, or short videos</p>
                                            </div>
                                        </DropdownMenuItem>
                                    )}
                                    {!user.channel && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/channel/create" className="flex items-center gap-3 py-3 cursor-pointer focus:bg-white/5">
                                                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-violet-500/20">
                                                    <Tv className="w-4 h-4 text-purple-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Create Channel</p>
                                                    <p className="text-xs text-muted-foreground">Start creating content</p>
                                                </div>
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        {mounted ? (
                            user ? (
                                <div className="flex items-center gap-2 md:gap-3">
                                    <Avatar className="h-8 w-8 md:h-10 md:w-10 border border-border">
                                        <AvatarImage src={user.avatar || undefined} />
                                        <AvatarFallback>{user.name ? user.name[0] : user.username[0]}</AvatarFallback>
                                    </Avatar>

                                    <div className="relative">
                                        <button
                                            onClick={() => setMenuOpen(!menuOpen)}
                                            className="flex items-center gap-1 md:gap-2 outline-none hover:bg-accent/50 p-1 md:p-1.5 rounded-lg transition-colors"
                                        >
                                            <span className="text-xs md:text-sm font-medium hidden sm:block">{user.name || user.username}</span>
                                            <ChevronDown className={`h-3 w-3 md:h-4 md:w-4 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {menuOpen && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-40"
                                                    onClick={() => setMenuOpen(false)}
                                                />
                                                <div className="absolute right-0 top-10 md:top-12 z-50 w-56 rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
                                                    <div className="px-2 py-1.5 text-sm font-normal">
                                                        <div className="flex flex-col space-y-1">
                                                            <p className="text-sm font-medium leading-none">{user.name || user.username}</p>
                                                            <p className="text-xs leading-none text-muted-foreground">
                                                                {user.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="h-px bg-border -mx-1 my-1" />

                                                    <Link
                                                        href="/profile"
                                                        className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                                                        onClick={() => setMenuOpen(false)}
                                                    >
                                                        <UserIcon className="mr-2 h-4 w-4" />
                                                        <span>Profile</span>
                                                    </Link>

                                                    <Link
                                                        href="/settings"
                                                        className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                                                        onClick={() => setMenuOpen(false)}
                                                    >
                                                        <Settings className="mr-2 h-4 w-4" />
                                                        <span>Settings</span>
                                                    </Link>

                                                    {user.channel ? (
                                                        <>
                                                            <Link
                                                                href={`/channel/${user.channel.handle}`}
                                                                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                                                                onClick={() => setMenuOpen(false)}
                                                            >
                                                                <Tv className="mr-2 h-4 w-4" />
                                                                <span>Your Channel</span>
                                                            </Link>
                                                            <Link
                                                                href="/inbox"
                                                                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground text-primary font-medium"
                                                                onClick={() => setMenuOpen(false)}
                                                            >
                                                                <Bell className="mr-2 h-4 w-4" />
                                                                <span>Inbox</span>
                                                            </Link>
                                                        </>
                                                    ) : (
                                                        <Link
                                                            href="/channel/create"
                                                            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground text-primary"
                                                            onClick={() => setMenuOpen(false)}
                                                        >
                                                            <Tv className="mr-2 h-4 w-4" />
                                                            <span>Create Channel</span>
                                                        </Link>
                                                    )}

                                                    <div className="h-px bg-border -mx-1 my-1" />

                                                    <button
                                                        onClick={() => {
                                                            handleLogout();
                                                            setMenuOpen(false);
                                                        }}
                                                        className="relative w-full flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground text-red-600 hover:text-red-600"
                                                    >
                                                        <LogOut className="mr-2 h-4 w-4" />
                                                        <span>Log out</span>
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <Link href="/login">
                                    <Button className="rounded-full px-4 md:px-8 h-8 md:h-10 text-xs md:text-base bg-primary text-primary-foreground hover:bg-primary/90">Sign In</Button>
                                </Link>
                            )
                        ) : (
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-secondary animate-pulse" />
                        )}
                    </div>
                </>
            ) : (
                /* Mobile Search Overlay View */
                <div className="flex items-center gap-2 w-full animate-in slide-in-from-right-2 duration-200">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileSearchOpen(false)}
                        className="shrink-0"
                    >
                        <ChevronDown className="h-6 w-6 rotate-90" />
                    </Button>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (searchQuery) {
                                router.push(`/results?search_query=${encodeURIComponent(searchQuery)}`);
                                setIsMobileSearchOpen(false);
                            }
                        }}
                        className="flex-1 relative"
                    >
                        <Input
                            autoFocus
                            placeholder="Search videos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 px-4 bg-secondary border-none rounded-full"
                        />
                    </form>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            if (searchQuery) {
                                router.push(`/results?search_query=${encodeURIComponent(searchQuery)}`);
                                setIsMobileSearchOpen(false);
                            }
                        }}
                    >
                        <Search className="h-5 w-5" />
                    </Button>
                </div>
            )}

            <VideoUploadDialog
                isOpen={uploadDialogOpen}
                onClose={() => setUploadDialogOpen(false)}
            />

            <CreateContentDialog
                isOpen={contentDialogOpen}
                onClose={() => setContentDialogOpen(false)}
            />
        </header>
    );
}
