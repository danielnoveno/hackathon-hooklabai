'use client';

import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
// Removed unused GSAP SplitText import 
// JIKA TIDAK PUNYA LISENSI CLUB GREENSOK, KITA PAKAI VERSI MANUAL SEDERHANA DI BAWAH INI.
import { useGSAP } from '@gsap/react';

// --- CATATAN PENTING ---
// Plugin "gsap/SplitText" itu berbayar.
// Jika Anda tidak punya lisensi, kode di atas akan error/tidak jalan di production.
// SAYA AKAN BUATKAN VERSI GRATIS (MANUAL SPLIT) DI BAWAH INI AGAR AMAN.

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 50,
  duration = 1
}) => {
  const containerRef = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    
    // Ambil semua span (huruf)
    const letters = containerRef.current.querySelectorAll('.split-char');
    
    gsap.fromTo(letters, 
      { 
        opacity: 0, 
        y: 50,
        rotateX: -90 
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: duration,
        stagger: delay / 1000,
        ease: 'back.out(1.7)',
        overwrite: 'auto'
      }
    );
  }, [text]); // Re-animate if text changes

  return (
    <h1 
      ref={containerRef} 
      className={`inline-block overflow-hidden ${className}`}
      aria-label={text}
    >
      {text.split('').map((char, i) => (
        <span 
          key={i} 
          className="split-char inline-block origin-bottom"
          style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char}
        </span>
      ))}
    </h1>
  );
};

export default SplitText;