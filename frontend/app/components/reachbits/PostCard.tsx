'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface Post {
    text: string;
    total_engagement: number;
    author_display_name: string;
    author_username: string;
    author_pfp_url: string;
    timestamp: string;
    hash: string;
}

interface PostCardProps {
    post: Post;
    index: number;
}

export default function PostCard({ post, index }: PostCardProps) {
    const formatEngagement = (num: number) => {
        if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        }
        return num.toString();
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInDays > 0) {
            return `${diffInDays}d ago`;
        } else if (diffInHours > 0) {
            return `${diffInHours}h ago`;
        } else {
            return 'Just now';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-blue-400/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,80,240,0.15)]"
        >
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />

            {/* Author Info */}
            <div className="flex items-start gap-3 mb-3 relative z-10">
                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white/10 group-hover:ring-blue-400/30 transition-all">
                    {post.author_pfp_url ? (
                        <Image
                            src={post.author_pfp_url}
                            alt={post.author_display_name}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                            {post.author_display_name?.charAt(0) || '?'}
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="text-white font-semibold text-sm truncate group-hover:text-blue-300 transition-colors">
                            {post.author_display_name || 'Anonymous'}
                        </h4>
                        <span className="text-blue-400 text-xs">✓</span>
                    </div>
                    <p className="text-gray-400 text-xs">
                        @{post.author_username || 'unknown'} · {formatTimestamp(post.timestamp)}
                    </p>
                </div>
            </div>

            {/* Post Content */}
            <div className="relative z-10 mb-4">
                <p className="text-gray-200 text-sm leading-relaxed line-clamp-4">
                    {post.text}
                </p>
            </div>

            {/* Engagement Stats */}
            <div className="flex items-center gap-4 text-xs text-gray-400 relative z-10">
                <div className="flex items-center gap-1.5 group/stat">
                    <svg className="w-4 h-4 group-hover/stat:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="group-hover/stat:text-red-400 transition-colors">
                        {formatEngagement(Math.floor(post.total_engagement * 0.6))}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 group/stat">
                    <svg className="w-4 h-4 group-hover/stat:text-green-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="group-hover/stat:text-green-400 transition-colors">
                        {formatEngagement(Math.floor(post.total_engagement * 0.2))}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 group/stat">
                    <svg className="w-4 h-4 group-hover/stat:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="group-hover/stat:text-blue-400 transition-colors">
                        {formatEngagement(Math.floor(post.total_engagement * 0.2))}
                    </span>
                </div>

                <div className="ml-auto flex items-center gap-1.5 font-semibold text-blue-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>{formatEngagement(post.total_engagement)}</span>
                </div>
            </div>

            {/* Base Chain Badge */}
            <div className="absolute top-3 right-3 px-2 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full backdrop-blur-sm">
                <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">Base</span>
            </div>
        </motion.div>
    );
}
