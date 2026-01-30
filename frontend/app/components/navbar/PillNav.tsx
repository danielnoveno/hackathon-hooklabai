'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';

export type PillNavItem = {
  label: string;
  href: string;
};

export interface PillNavProps {
  items: PillNavItem[];
  className?: string;
}

const PillNav: React.FC<PillNavProps> = ({
  items,
  className = '',
}) => {
  // CONFIG WARNA GLASSMORPHISM
  const baseColor = 'rgba(255, 255, 255, 0.08)'; 
  const textColor = '#ffffff'; 
  const circleColor = '#ffffff'; 
  const hoverTextColor = '#000000'; 

  // REFS GSAP
  const circleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tlRefs = useRef<(gsap.core.Timeline | null)[]>([]);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLAnchorElement | null>(null);

  // LOGIKA ANIMASI GSAP (Sama seperti sebelumnya)
  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement as HTMLElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        });

        const label = pill.querySelector('.pill-label');
        const hoverLabel = pill.querySelector('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (hoverLabel) gsap.set(hoverLabel, { y: h + 12, opacity: 0 });

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 0.5, ease: 'power3.out', overwrite: 'auto' }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 0.5, ease: 'power3.out', overwrite: 'auto' }, 0);
        }

        if (hoverLabel) {
          gsap.set(hoverLabel, { y: Math.ceil(h + 20), opacity: 0 });
          tl.to(hoverLabel, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', overwrite: 'auto' }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();
    const onResize = () => layout();
    window.addEventListener('resize', onResize);
    if ((document as any).fonts?.ready) {
      (document as any).fonts.ready.then(layout).catch(() => {});
    }

    if (navItemsRef.current) {
        gsap.fromTo(navItemsRef.current, 
            { width: 0, opacity: 0 }, 
            { width: 'auto', opacity: 1, duration: 0.8, ease: 'power3.out' }
        );
    }
    if (logoRef.current) {
        gsap.fromTo(logoRef.current, 
            { scale: 0, rotation: -180 }, 
            { scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.7)' }
        );
    }

    return () => window.removeEventListener('resize', onResize);
  }, [items]);

  const handleEnter = (i: number) => tlRefs.current[i]?.play();
  const handleLeave = (i: number) => tlRefs.current[i]?.reverse();

  // CSS Variables - Tinggi Navbar diperkecil dikit (50px)
  const cssVars = {
    ['--nav-h']: '50px', 
    ['--base']: baseColor,
    ['--text']: textColor,
    ['--hover-text']: hoverTextColor,
    ['--circle']: circleColor,
    ['--pill-pad-x']: '14px', 
  } as React.CSSProperties;

  return (
    <div className="w-full flex justify-center pointer-events-none">
      <nav
        className={`pointer-events-auto inline-flex items-center gap-1 box-border px-1.5 rounded-full ${className}`}
        aria-label="Primary"
        style={{
            ...cssVars,
            height: 'var(--nav-h)',
            background: 'var(--base)', 
            backdropFilter: 'blur(16px)', 
            WebkitBackdropFilter: 'blur(16px)', 
            border: '1px solid rgba(255, 255, 255, 0.15)', 
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)', 
        }}
      >
        {/* 1. LOGO SECTION - DIPERKECIL (40px) */}
        <Link
          href="/"
          ref={logoRef}
          className="rounded-full flex items-center justify-center overflow-hidden shrink-0 ml-1"
          style={{
            width: '40px',  // Lebih kecil
            height: '40px', // Lebih kecil
          }}
        >
          <img 
            src="/logo_hooklab.png" 
            alt="HookLab Logo" 
            className="w-full h-full object-contain scale-110" 
            onError={(e) => { e.currentTarget.style.display = 'none'; }} 
          />
        </Link>

        {/* 2. MENU ITEMS */}
        <div
          ref={navItemsRef}
          className="relative flex items-center h-full overflow-hidden"
        >
          <ul className="flex items-center m-0 p-0 h-full list-none gap-0.5"> 
            {items.map((item, i) => {
              return (
                <li key={i} className="h-[80%] flex items-center">
                  <Link
                    href={item.href}
                    className="relative overflow-hidden inline-flex items-center justify-center h-full no-underline rounded-full font-medium text-[13px] uppercase tracking-wide cursor-pointer select-none transition-colors duration-300"
                    style={{
                        paddingLeft: 'var(--pill-pad-x)',
                        paddingRight: 'var(--pill-pad-x)',
                        color: 'var(--text)',
                    }}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                  >
                    <span
                      className="hover-circle absolute left-1/2 bottom-0 rounded-full z-[1] block pointer-events-none"
                      style={{ background: 'var(--circle)', willChange: 'transform' }}
                      aria-hidden="true"
                      ref={el => { circleRefs.current[i] = el; }}
                    />

                    <span className="label-stack relative inline-block leading-[1] z-[2]">
                      <span className="pill-label relative z-[2] inline-block" style={{ willChange: 'transform' }}>
                        {item.label}
                      </span>
                      <span
                        className="pill-label-hover absolute left-0 top-0 z-[3] inline-block whitespace-nowrap"
                        style={{ color: 'var(--hover-text)', willChange: 'transform, opacity', opacity: 0 }}
                        aria-hidden="true"
                      >
                        {item.label}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default PillNav;