'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from './reachbits/PostCard';

interface Post {
    text: string;
    total_engagement: number;
    author_display_name: string;
    author_username: string;
    author_pfp_url: string;
    timestamp: string;
    hash: string;
}

export default function TrendingPosts() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        async function fetchPosts() {
            try {
                const response = await fetch('/api/posts');
                if (!response.ok) {
                    throw new Error('Failed to fetch posts');
                }
                const data = await response.json();
                setPosts(data.posts || []);
            } catch (err: any) {
                console.error('Error fetching posts:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchPosts();
    }, []);

    // Auto-play carousel
    useEffect(() => {
        if (posts.length === 0) return;

        const interval = setInterval(() => {
            setDirection(1);
            setCurrentIndex((prev) => (prev + 1) % posts.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [posts.length]);

    const goToSlide = (index: number) => {
        setDirection(index > currentIndex ? 1 : -1);
        setCurrentIndex(index);
    };

    const goToPrevious = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
    };

    const goToNext = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % posts.length);
    };

    if (loading) {
        return (
            <div className="py-20 px-6 max-w-6xl mx-auto">
                <div className="text-center">
                    <div className="inline-block w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 mt-4">Loading trending posts...</p>
                </div>
            </div>
        );
    }

    if (error || posts.length === 0) {
        return null; // Don't show section if there's an error or no posts
    }

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        })
    };

    return (
        <section id="trending" className="py-20 px-6 max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="inline-block px-4 py-1.5 mb-4 border border-blue-500/30 rounded-full bg-blue-500/10 backdrop-blur-md"
                >
                    <span className="text-xs font-bold text-blue-300 tracking-widest uppercase">
                        Powered by Real Data
                    </span>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-3xl md:text-4xl font-bold text-white mb-4"
                >
                    Trending on{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-400 animate-text-shine">
                        Base
                    </span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed"
                >
                    These are real viral posts from the Base ecosystem, scraped and analyzed by our AI.
                    <br />
                    Learn from what works, create what resonates.
                </motion.p>
            </div>

            {/* Carousel Container */}
            <div className="relative max-w-2xl mx-auto">
                {/* Carousel Wrapper */}
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-sm p-8 md:p-12 min-h-[400px] flex items-center justify-center">
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        <motion.div
                            key={currentIndex}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            className="w-full"
                        >
                            <PostCard post={posts[currentIndex]} index={0} />
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Arrows */}
                    <button
                        onClick={goToPrevious}
                        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110 group z-10"
                        aria-label="Previous post"
                    >
                        <svg className="w-5 h-5 text-white group-hover:text-blue-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <button
                        onClick={goToNext}
                        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110 group z-10"
                        aria-label="Next post"
                    >
                        <svg className="w-5 h-5 text-white group-hover:text-blue-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Dots Indicator */}
                <div className="flex items-center justify-center gap-2 mt-8">
                    {posts.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`transition-all duration-300 rounded-full ${index === currentIndex
                                ? 'w-8 h-2 bg-blue-400'
                                : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* Bottom CTA */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center mt-12"
            >
                <div className="inline-block px-6 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                    <p className="text-xs text-gray-400">
                        <span className="text-blue-400 font-semibold">Data-driven insights</span> from the{' '}
                        <span className="text-white font-semibold">Farcaster /base channel</span> via Neynar API
                    </p>
                </div>
            </motion.div>
        </section>
    );
}
