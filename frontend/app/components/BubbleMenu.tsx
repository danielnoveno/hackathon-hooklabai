'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export type MenuItem = {
  label: string;
  href?: string;
  onClick?: () => void;
  ariaLabel?: string;
  /** Derajat rotasi (misal: -5, 3, 8) */
  rotation?: number;
  active?: boolean;
  hoverStyles?: {
    bgColor?: string;
    textColor?: string;
  };
};

export type BubbleMenuProps = {
  className?: string;
  style?: CSSProperties;
  items?: MenuItem[];
  animationEase?: string;
  animationDuration?: number;
  staggerDelay?: number;
};

export default function BubbleMenu({
  className,
  style,
  items = [],
  animationEase = 'back.out(1.5)',
  animationDuration = 0.5,
  staggerDelay = 0.12
}: BubbleMenuProps) {
  const bubblesRef = useRef<HTMLAnchorElement[]>([]);
  const labelRefs = useRef<HTMLSpanElement[]>([]);

  // Animation on mount (Muncul satu per satu)
  useEffect(() => {
    const bubbles = bubblesRef.current.filter(Boolean).slice(0, items.length);
    const labels = labelRefs.current.filter(Boolean).slice(0, items.length);

    if (!bubbles.length) return;

    // Reset state awal
    gsap.set(bubbles, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(labels, { y: 24, autoAlpha: 0 });

    bubbles.forEach((bubble, i) => {
      const delay = i * staggerDelay;
      const tl = gsap.timeline({ delay });

      tl.to(bubble, {
        scale: 1,
        duration: animationDuration,
        ease: animationEase
      });

      if (labels[i]) {
        tl.to(
          labels[i],
          {
            y: 0,
            autoAlpha: 1,
            duration: animationDuration,
            ease: 'power3.out'
          },
          '-=' + animationDuration * 0.9
        );
      }
    });

  }, [items, animationEase, animationDuration, staggerDelay]);

  return (
    <div className={`w-full max-w-[1000px] mx-auto ${className || ''}`} style={style}>
      <style>{`
        .bubble-menu-items .pill-link {
          /* Set rotasi dasar dari variabel CSS */
          transform: rotate(var(--item-rot));
          transition: transform 0.3s ease, background 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }
        
        /* Hover State */
        .bubble-menu-items .pill-link:hover,
        .bubble-menu-items .pill-link.is-active {
          /* PENTING: Tetap pertahankan rotasi saat scale up */
          transform: rotate(var(--item-rot)) scale(1.08);
          background: var(--hover-bg) !important;
          border-color: rgba(255,255,255,0.6) !important;
          color: var(--hover-color) !important;
          box-shadow: 0 0 25px rgba(37, 99, 235, 0.7);
          z-index: 10;
        }
        
        /* Active/Click State */
        .bubble-menu-items .pill-link:active {
          transform: rotate(var(--item-rot)) scale(0.95);
        }
      `}</style>

      <ul
        className={[
          'bubble-menu-items',
          'list-none m-0 p-0',
          'flex flex-wrap',
          'justify-center items-center',
          // Reduced gap for tighter layout
          'gap-2',
          'pointer-events-auto',
          'relative z-10',
          'max-w-2xl mx-auto'
        ].join(' ')}
      >
        {items.map((item, idx) => (
          <li
            key={idx}
            className="flex-shrink-0"
          >
            <a
              role="button"
              href={item.href || '#'}
              onClick={(e) => {
                e.preventDefault();
                item.onClick?.();
              }}
              aria-label={item.ariaLabel || item.label}
              className={[
                'pill-link',
                item.active ? 'is-active' : '',
                'px-4 py-2',
                'rounded-full',
                'no-underline',
                // Glassmorphism Styles
                'bg-white/10',
                'backdrop-blur-md',
                'border border-white/20',
                'text-white',
                'shadow-lg',
                'flex items-center justify-center',
                'relative',
                'whitespace-nowrap overflow-hidden'
              ].join(' ')}
              style={
                {
                  // Menerapkan nilai rotasi dari data props ke variabel CSS
                  ['--item-rot']: `${item.rotation ?? 0}deg`,
                  ['--hover-bg']: item.hoverStyles?.bgColor || '#2563EB',
                  ['--hover-color']: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  willChange: 'transform',
                } as CSSProperties
              }
              ref={el => {
                if (el) bubblesRef.current[idx] = el;
              }}
            >
              <span
                className="pill-label inline-block"
                style={{
                  willChange: 'transform, opacity',
                  // Sedikit kompensasi rotasi pada teks agar lebih mudah dibaca (opsional)
                  transform: `rotate(${(item.rotation ?? 0) * -0.3}deg)`
                }}
                ref={el => {
                  if (el) labelRefs.current[idx] = el;
                }}
              >
                {item.label}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}