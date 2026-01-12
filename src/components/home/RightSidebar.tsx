'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { searchApi } from '@/lib/api/search';
import TrendingTopics from './TrendingTopics';
import WhoToFollow from './WhoToFollow';
import TrendingVideosWidget from './TrendingVideosWidget';

export default function RightSidebar() {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchQuery.length < 2) {
                setSuggestions([]);
                return;
            }

            try {
                const response = await searchApi.getSuggestions(searchQuery);
                if (response.success) {
                    setSuggestions(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch suggestions:', error);
            }
        };

        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery) {
            router.push(`/results?search_query=${encodeURIComponent(searchQuery)}`);
            setShowSuggestions(false);
        }
    };

    return (
        <aside className="fixed right-0 top-0 bottom-0 w-80 xl:w-96 hidden lg:flex flex-col border-l border-white/10 bg-background overflow-y-auto custom-scrollbar">
            {/* Search Bar */}
            <div className="sticky top-0 bg-background z-10 p-4" ref={searchRef}>
                <form onSubmit={handleSearch} className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Search className="h-4 w-4" />
                    </div>
                    <Input
                        type="search"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border-transparent focus:bg-background focus:border-primary/50 rounded-full text-sm"
                        autoComplete="off"
                    />

                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-white/10 rounded-2xl shadow-2xl py-2 overflow-hidden z-50">
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className="w-full px-4 py-2 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                                    onClick={() => {
                                        setSearchQuery(suggestion.text);
                                        router.push(`/results?search_query=${encodeURIComponent(suggestion.text)}`);
                                        setShowSuggestions(false);
                                    }}
                                >
                                    <Search className="h-4 w-4 text-muted-foreground" />
                                    <span className="flex-1 truncate">{suggestion.text}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </form>
            </div>

            {/* Widgets */}
            <div className="p-4 pt-0 space-y-4">
                <TrendingTopics />
                <WhoToFollow />
                <TrendingVideosWidget />
            </div>

            {/* Footer Links */}
            <div className="px-4 py-6 text-xs text-muted-foreground">
                <div className="flex flex-wrap gap-x-2 gap-y-1">
                    <a href="#" className="hover:underline">Terms of Service</a>
                    <a href="#" className="hover:underline">Privacy Policy</a>
                    <a href="#" className="hover:underline">Cookie Policy</a>
                </div>
                <p className="mt-2">© 2026 MiniYT</p>
            </div>
        </aside>
    );
}
