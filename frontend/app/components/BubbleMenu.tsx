import type { CSSProperties } from 'react';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export type MenuItem = {
  label: string;
  href?: string;
  onClick?: () => void;
  ariaLabel?: string;
  rotation?: number;
  active?: boolean; // Added active state
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

  // Animation on mount
  useEffect(() => {
    const bubbles = bubblesRef.current.filter(Boolean).slice(0, items.length); 
    const labels = labelRefs.current.filter(Boolean).slice(0, items.length);
    
    if (!bubbles.length) return;

    gsap.set(bubbles, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(labels, { y: 24, autoAlpha: 0 });

    bubbles.forEach((bubble, i) => {
      const delay = i * staggerDelay + gsap.utils.random(-0.05, 0.05);
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

  // Resize handler for desktop/mobile rotations
  useEffect(() => {
    const handleResize = () => {
      const bubbles = bubblesRef.current.filter(Boolean);
      const isDesktop = window.innerWidth >= 900;
      bubbles.forEach((bubble, i) => {
        const item = items[i];
        if (bubble && item) {
          const rotation = isDesktop ? (item.rotation ?? 0) : 0;
          gsap.set(bubble, { rotation });
        }
      });
    };
    
    // Initial call
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [items]);

  return (
    <div className={`w-full max-w-[1000px] mx-auto ${className || ''}`} style={style}>
      <style>{`
        .bubble-menu-items .pill-link {
          transition: transform 0.3s ease, background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }
        @media (min-width: 900px) {
          .bubble-menu-items .pill-link {
            transform: rotate(var(--item-rot));
          }
          .bubble-menu-items .pill-link:hover,
          .bubble-menu-items .pill-link.is-active {
            transform: rotate(var(--item-rot)) scale(1.06);
            background: var(--hover-bg) !important;
            border-color: rgba(255,255,255,0.3) !important;
            color: var(--hover-color) !important;
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
          }
          .bubble-menu-items .pill-link:active {
            transform: rotate(var(--item-rot)) scale(.94);
          }
        }
        @media (max-width: 899px) {
           /* On mobile, simpler layout */
          .bubble-menu-items .pill-link:hover,
          .bubble-menu-items .pill-link.is-active {
            transform: scale(1.06);
            background: var(--hover-bg);
            border-color: rgba(255,255,255,0.3);
            color: var(--hover-color);
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
          }
          .bubble-menu-items .pill-link:active {
            transform: scale(.94);
          }
        }
      `}</style>
      
      <ul
        className={[
          'bubble-menu-items',
          'list-none m-0 p-0',
          'flex flex-wrap',
          'justify-center',
          'gap-3', 
          'pointer-events-auto',
          'relative z-10'
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
                'rounded-[999px]',
                'no-underline',
                // Glassmorphism Styles
                'bg-white/5', 
                'backdrop-blur-md',
                'border border-white/10',
                'text-white', // Text white by default
                'shadow-sm', 
                'flex items-center justify-center',
                'relative',
                'whitespace-nowrap overflow-hidden'
              ].join(' ')}
              style={
                {
                  ['--item-rot']: `${item.rotation ?? 0}deg`,
                  ['--hover-bg']: 'rgba(59, 130, 246, 0.4)', // Glassy blue active
                  ['--hover-color']: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  lineHeight: 1.2,
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
