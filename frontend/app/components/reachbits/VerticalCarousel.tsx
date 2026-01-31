'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';

// Icons untuk setiap model (bisa diganti icon lain jika mau)
import { FiCpu, FiImage, FiVideo } from 'react-icons/fi';

export interface CarouselItem {
  id: number;
  title: string;
  modelName: string;
  description: string;
  icon: React.ReactNode;
  color: string; // Warna glow spesifik per item
}

// Data Model Aigent
const MODEL_ITEMS: CarouselItem[] = [
  {
    id: 1,
    title: 'Strategic Intelligence',
    modelName: 'GPT-OSS 120B',
    description: 'Analyzes millions of data points to engineer mathematically optimized hooks. Context-aware intelligence tailored for Base.',
    icon: <FiCpu className="w-6 h-6" />,
    color: '#22d3ee' // Cyan
  },
  {
    id: 2,
    title: 'High-Fidelity Visuals',
    modelName: 'Eigen Image',
    description: 'Transforms text hooks into arresting visuals instantly. Generated with high prompt-fidelity to capture attention.',
    icon: <FiImage className="w-6 h-6" />,
    color: '#a855f7' // Purple
  },
  {
    id: 3,
    title: 'Dynamic Motion Engine',
    modelName: 'wan2.2 Turbo',
    description: 'Brings static ideas to life with prompt-guided motion. Maximizes retention rates with cinematic video generation.',
    icon: <FiVideo className="w-6 h-6" />,
    color: '#f97316' // Orange
  }
];

const ITEM_HEIGHT = 200; // Tinggi per item
const GAP = 20; // Jarak antar item

export default function VerticalCarousel() {
  const [isHovered, setIsHovered] = useState(false);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Duplikasi data untuk efek infinite loop yang mulus
  // Kita duplikasi 4x agar cukup panjang untuk scrolling halus
  const items = useMemo(() => [...MODEL_ITEMS, ...MODEL_ITEMS, ...MODEL_ITEMS, ...MODEL_ITEMS], []);

  useEffect(() => {
    const startScroll = async () => {
      if (isHovered) {
        controls.stop();
        return;
      }

      // Total tinggi 1 set data original
      const totalHeight = MODEL_ITEMS.length * (ITEM_HEIGHT + GAP);

      await controls.start({
        y: [0, -totalHeight], // Gerak ke atas
        transition: {
          ease: "linear",
          duration: 15, // Kecepatan scroll (makin besar makin pelan)
          repeat: Infinity,
          repeatType: "loop"
        }
      });
    };

    startScroll();
  }, [isHovered, controls]);

  return (
    <div 
      className="relative w-full h-[600px] overflow-hidden rounded-3xl bg-black/20 border border-white/10 backdrop-blur-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={containerRef}
    >
      {/* Overlay Gradient Atas & Bawah untuk efek Fading */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black via-black/80 to-transparent z-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black via-black/80 to-transparent z-20 pointer-events-none" />

      {/* Track Carousel Vertikal */}
      <motion.div
        className="flex flex-col items-center py-4"
        animate={controls}
        style={{ gap: GAP }}
      >
        {items.map((item, index) => (
          <CarouselItemCard key={`${item.id}-${index}`} item={item} />
        ))}
      </motion.div>
    </div>
  );
}

// Komponen Kartu Item Individual
function CarouselItemCard({ item }: { item: CarouselItem }) {
  return (
    <div 
      className="group relative shrink-0 w-[90%] md:w-[80%] rounded-2xl p-[1px] overflow-hidden"
      style={{ height: ITEM_HEIGHT }}
    >
      {/* Border Gradient Glow */}
      <div 
        className="absolute inset-0 opacity-50 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(135deg, ${item.color}, transparent 60%)` }} 
      />
      
      {/* Inner Card Content */}
      <div className="relative h-full w-full bg-[#0a0a0a]/90 backdrop-blur-xl rounded-2xl p-6 flex flex-col justify-center border border-white/5 group-hover:bg-[#0a0a0a]/80 transition-colors">
        
        {/* Header Icon & Title */}
        <div className="flex items-center gap-4 mb-3">
          <div 
            className="p-3 rounded-full bg-white/5 border border-white/10 shadow-lg"
            style={{ color: item.color, boxShadow: `0 0 15px ${item.color}30` }}
          >
            {item.icon}
          </div>
          <div>
            <h4 className="text-white font-bold text-lg leading-tight group-hover:text-blue-200 transition-colors">
              {item.modelName}
            </h4>
            <span 
              className="text-xs font-mono uppercase tracking-widest opacity-70"
              style={{ color: item.color }}
            >
              {item.title}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm leading-relaxed">
          {item.description}
        </p>

        {/* Shine Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine-fast pointer-events-none" />
      </div>
    </div>
  );
}