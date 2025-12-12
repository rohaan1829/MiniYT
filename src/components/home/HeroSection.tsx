'use client';

import { Button } from '@/components/ui/button';
import { Play, Info } from 'lucide-react';
import { VIDEOS } from '@/data/mockData';
import Link from 'next/link';

export default function HeroSection() {
    const featuredVideo = VIDEOS[0]; // Using the first video as featured

    return (
        <div className="relative w-full h-[60vh] min-h-[400px] rounded-2xl overflow-hidden mb-8 group">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${featuredVideo.thumbnail})` }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 px-8 pb-6 md:px-12 md:pb-8 max-w-2xl text-white">
                <span className="inline-block px-3 py-1 mb-4 text-xs font-bold uppercase tracking-wider bg-primary text-white rounded-full">
                    Featured Premiere
                </span>
                <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
                    {featuredVideo.title}
                </h1>
                <div className="flex items-center gap-4 mb-6 text-sm md:text-base text-gray-200">
                    <div className="flex items-center gap-2">
                        <img src={featuredVideo.channelAvatar} className="w-6 h-6 rounded-full" alt="" />
                        <span className="font-semibold">{featuredVideo.channelName}</span>
                    </div>
                    <span>•</span>
                    <span>{featuredVideo.views} views</span>
                    <span>•</span>
                    <span>{featuredVideo.duration}</span>
                </div>

                <p className="text-gray-300 mb-8 line-clamp-3 text-lg md:text-xl max-w-xl">
                    Join us as we explore the cutting-edge developments in artificial intelligence agents and how they are reshaping our digital future. An in-depth deep dive you don't want to miss.
                </p>

                <div className="flex flex-wrap gap-4">
                    <Link href={`/watch/${featuredVideo.id}`}>
                        <Button size="lg" className="bg-white text-black hover:bg-white/90 rounded-full px-8 text-lg font-bold h-12">
                            <Play className="mr-2 h-5 w-5 fill-current" /> Play Now
                        </Button>
                    </Link>
                    <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm rounded-full px-8 text-lg h-12">
                        <Info className="mr-2 h-5 w-5" /> More Info
                    </Button>
                </div>
            </div>
        </div>
    );
}
