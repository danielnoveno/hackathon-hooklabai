'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, useMotionValue, useAnimationFrame } from 'framer-motion';
import Plasma from './reachbits/Plasma';
import PillNav from './navbar/PillNav';
import SplitText from './reachbits/SplitText';
import TextType from './reachbits/TextType';
import CurvedLoop from './reachbits/CurvedLoop';
import ScrollFloat from './reachbits/ScrollFloat';
import VerticalCarousel from './reachbits/VerticalCarousel'; // Pastikan komponen ini ada
import TrendingPosts from './TrendingPosts';
import FAQ from './FAQ';
import Footer from './Footer';

type LandingPageProps = {
  onFinish: () => void;
};

// Varian animasi Stagger
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100 }
  },
};

// Varian Fade Up standard
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
};

export default function LandingPage({ onFinish }: LandingPageProps) {
  const [fadeOut, setFadeOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- CAROUSEL LOGIC (INFINITE LOOP + DRAG) ---
  const carouselRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);

  // 1. DATA ASLI (Hanya 3 Item Sesuai Request)
  const baseFeatures = [
    {
      id: "01",
      title: "Blind Hook Selection",
      desc: "Focus on Impact & Intentional Creation. AI generates hooks with hidden bodies to prevent creative bias."
    },
    {
      id: "02",
      title: "Real-time Trend-Jacking",
      desc: "Directly indexed from Farcaster /base channel via Neynar API. Proven viral formulas."
    },
    {
      id: "03",
      title: "Hybrid Subscription",
      desc: "Gas-less Start with 5 free credits. Onchain Transparency via Base Smart Contract."
    }
  ];

  // 2. DUPLIKASI DATA (Untuk Infinite Loop)
  const featuresData = [...baseFeatures, ...baseFeatures, ...baseFeatures, ...baseFeatures];

  // 3. LOGIC LOOPING (Reset Posisi)
  useEffect(() => {
    if (carouselRef.current) {
      setContentWidth(carouselRef.current.scrollWidth / 4);
    }
  }, []);

  useAnimationFrame((t, delta) => {
    if (isDragging) return;

    const speed = 0.5; // Kecepatan auto scroll
    let newX = x.get() - (speed * (delta / 10));

    if (contentWidth > 0 && newX <= -contentWidth) {
      newX = 0;
    }
    if (contentWidth > 0 && newX > 0) {
      newX = -contentWidth;
    }

    x.set(newX);
  });

  const handleGetStarted = () => {
    setFadeOut(true);
    setTimeout(() => onFinish(), 500);
  };

  const navItems = [
    { label: 'About', href: '#about' },
    { label: 'Features', href: '#features' },
    { label: 'Model', href: '#model' },
    { label: 'FAQ', href: '#faq' }
  ];

  return (
    <div className={`
      relative w-full h-screen bg-black flex flex-col items-center
      transition-opacity duration-500
      ${fadeOut ? 'opacity-0' : 'opacity-100'}
    `}>

      {/* 1. BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0">
        <Plasma
          color="#0050f0"
          speed={0.5}
          direction="forward"
          scale={1.2}
          opacity={0.8}
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      </div>

      {/* 2. SCROLLABLE CONTENT CONTAINER */}
      <div
        ref={containerRef}
        className="relative z-10 w-full h-full overflow-y-auto scroll-smooth custom-scrollbar pb-32"
      >

        {/* --- HERO SECTION --- */}
        <section className="min-h-screen flex flex-col justify-center relative overflow-hidden pb-20">

          <div className="absolute top-[10%] left-[-50px] w-[120%] opacity-90 rotate-[-5deg] pointer-events-none z-0">
            <CurvedLoop
              marqueeText="Empowering the Next Wave of Onchain Creators"
              speed={3}
              direction="right"
              curveAmount={80}
              className="font-black tracking-widest drop-shadow-[0_2px_4px_rgba(0,80,240,0.3)]"
            />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-lg mx-auto z-10 -mt-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="inline-block px-3 py-1 mb-6 border border-blue-500/30 rounded-full bg-blue-500/10 backdrop-blur-md"
            >
              <span className="text-[10px] font-bold text-blue-300 tracking-widest uppercase glow-text">
                The Social Gateway to Base
              </span>
            </motion.div>

            <div className="mb-2 relative">
              <SplitText
                text="HookLab AI"
                className="text-5xl md:text-6xl font-bold text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] font-poppins tracking-tight leading-tight"
                delay={50}
                duration={1}
              />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-lg md:text-xl text-gray-300 font-light max-w-md leading-relaxed mb-2"
            >
              Empowering the Next Wave of <br />
              <span className="font-bold animate-text-shine text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-400 relative inline-block">
                Onchain Creators
                <span className="absolute inset-0 text-blue-500 opacity-30 blur-[1px] animate-glitch-subtle -z-10" aria-hidden="true">Onchain Creators</span>
              </span>
            </motion.div>

            <div className="h-12 flex items-start justify-center relative z-20">
              <TextType
                text={[
                  "Go viral through data-driven AI hooks.",
                  "A sustainable onchain economy."
                ]}
                typingSpeed={40}
                deletingSpeed={20}
                pauseDuration={2000}
                loop={true}
                className="text-blue-200/70 text-sm font-light max-w-md leading-relaxed"
                cursorCharacter="_"
              />
            </div>

            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5, type: "spring" }}
              onClick={handleGetStarted}
              className="group relative px-8 py-3.5 bg-white text-black font-bold rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] active:scale-95 mt-6 z-20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 flex items-center justify-center gap-2 text-sm uppercase tracking-wide">
                Get Started
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </motion.button>
          </div>

          <div className="absolute top-[75%] left-[-50px] w-[120%] opacity-90 rotate-[5deg] pointer-events-none z-0">
            <CurvedLoop
              marqueeText="Empowering the Next Wave of Onchain Creators"
              speed={2}
              direction="left"
              curveAmount={-80}
              className="font-black tracking-widest drop-shadow-[0_2px_4px_rgba(0,80,240,0.3)]"
            />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ delay: 2, duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-0 right-0 flex flex-col items-center justify-center z-20 pointer-events-none"
          >
            <span className="text-[10px] uppercase tracking-[0.2em] text-blue-300/70 mb-2 font-medium">Scroll to View</span>
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>

        </section>

        {/* --- ABOUT SECTION --- */}
        <section id="about" className="py-20 px-6 max-w-xl mx-auto">

          <ScrollFloat
            scrollContainerRef={containerRef}
            animationDuration={2}
            ease='back.out(1.2)'
            scrollStart='top bottom-=10%'
            scrollEnd='center center'
            stagger={0.1}
            containerClassName="text-center mb-2"
            textClassName="text-4xl font-bold text-white"
          >
            Our Vision
          </ScrollFloat>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="mb-16 text-center text-gray-300 font-light text-lg leading-relaxed space-y-1"
          >
            <motion.p variants={itemVariants}>We bridge the gap between social media creativity and the Base ecosystem, turning the complexity of Web3
              into a <></>
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-blue-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">
                seamless, rewarding experience
              </span>
            </motion.p>
          </motion.div>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
            <h3 className="text-2xl font-bold text-white mb-8 text-center drop-shadow-md">Why HookLab AI?</h3>

            <div className="space-y-4">
              {[
                { title: "Zero-Friction Onboarding", desc: "Start without gas fees or complex wallet setups via Smart Wallet integration." },
                { title: "Engineered for Virality", desc: "AI analyzes real-time social trends to ensure your content hits the mark." },
                { title: "True Ownership", desc: "Monetize your influence directly on the blockchain." }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeInUp}
                  className="group relative bg-black/20 border border-white/5 p-5 rounded-xl overflow-hidden hover:bg-black/40 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 w-2 h-2 rounded-full bg-blue-400 group-hover:shadow-[0_0_10px_#60a5fa] transition-shadow" />
                    <div>
                      <h4 className="text-white font-bold mb-1 text-lg group-hover:text-blue-300 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </section>

        {/* --- KEY FEATURES SECTION (INFINITE + DRAGGABLE) --- */}
        <section id="features" className="py-20 overflow-hidden">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-3xl font-bold text-white mb-8 text-center"
          >
            Key Features
          </motion.h2>

          <div
            ref={carouselRef}
            className="relative w-full cursor-grab active:cursor-grabbing py-10 overflow-hidden"
            onMouseEnter={() => setIsDragging(true)}
            onMouseLeave={() => setIsDragging(false)}
          >
            <motion.div
              style={{ x }}
              drag="x"
              dragConstraints={{ left: -10000, right: 10000 }}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
              className="flex gap-8 px-6 w-max"
            >
              {featuresData.map((feature, i) => (
                <div
                  key={i}
                  className="group relative w-[280px] md:w-[320px] h-auto min-h-fit shrink-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-blue-400/50 hover:shadow-[0_0_30px_rgba(0,80,240,0.2)] flex flex-col pb-6"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_2px,rgba(0,0,0,0.2)_4px)] bg-[size:100%_4px] pointer-events-none opacity-20" />

                  <div className="relative px-6 pt-6">
                    <div
                      className="text-[6rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-600 animate-text-shine-slow mb-2"
                    >
                      {feature.id}
                    </div>
                  </div>

                  <div className="relative px-6 mt-2 flex-1">
                    <div className="w-10 h-1 bg-gradient-to-r from-blue-400 via-white to-blue-400 rounded-full mb-3 shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
                    <h4 className="text-xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">
                      {feature.title}
                    </h4>
                    <p className="text-gray-400 text-sm leading-relaxed font-light">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* --- MODEL SECTION (Vertical Carousel) --- */}
        <section id="model" className="py-20 px-6 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4"
            >
              The Engine<br />Behind Virality
            </motion.h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
              We don't rely on luck. We rely on state-of-the-art Aigent models to analyze, predict, and generate content engineered to stop the scroll.
            </p>
          </div>

          {/* IMPLEMENTASI VERTICAL CAROUSEL */}
          <div className="w-full">
            <VerticalCarousel />
          </div>

          <div className="text-center mt-12">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="inline-block px-4 py-2 rounded-full border border-white/10 bg-white/5 text-xs text-gray-400"
            >
              Validating your success with precision AI engineering.
            </motion.div>
          </div>
        </section>

        {/* --- TRENDING POSTS SECTION --- */}
        <TrendingPosts />

        {/* --- FAQ SECTION --- */}
        <FAQ />

        {/* --- FOOTER SECTION --- */}
        <Footer />

      </div>

      {/* 3. FIXED NAVBAR AT BOTTOM */}
      <div className="fixed bottom-10 w-full px-2 z-50 flex justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <PillNav items={navItems} />
        </div>
      </div>



      {/* Global Style & Animations */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        .glow-text {
          text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }

        .animate-text-shine {
            background-size: 200% auto;
            animation: textShine 4s linear infinite reverse;
            text-shadow: 0 0 15px rgba(59, 130, 246, 0.6), 0 0 30px rgba(255, 255, 255, 0.4); /* Glow */
        }

        @keyframes textShine {
            to {
                background-position: 200% center;
            }
        }

        .animate-glitch-subtle {
            animation: glitchSkew 3s infinite linear alternate-reverse;
        }

        @keyframes glitchSkew {
            0%, 100% { transform: translate(0); opacity: 0.3; }
            92% { transform: translate(0); opacity: 0.3; }
            94% { transform: translate(-2px, 1px) skew(-2deg); opacity: 0.5; color: #fff; }
            96% { transform: translate(2px, -1px) skew(2deg); opacity: 0.6; color: #0050f0; }
            98% { transform: translate(0); opacity: 0.3; }
        }

        /* --- Animasi Shine untuk Angka dan Strip di Key Features --- */
        .animate-text-shine-slow {
          background-size: 200% auto;
          animation: textShineSlow 6s linear infinite reverse;
        }
        @keyframes textShineSlow {
          to { background-position: 200% center; }
        }

        .animate-shine-bar {
          background-size: 200% auto;
          animation: shineBar 4s linear infinite;
        }
        @keyframes shineBar {
          to { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}