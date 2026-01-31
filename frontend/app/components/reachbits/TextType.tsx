'use client';

import { ElementType, useEffect, useRef, useState, createElement, useMemo, useCallback } from 'react';
import { gsap } from 'gsap';

interface TextTypeProps {
  text: string | string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  loop?: boolean;
  className?: string;
  cursorCharacter?: string;
}

const TextType = ({
  text,
  typingSpeed = 50,
  deletingSpeed = 30,
  pauseDuration = 2000,
  loop = true,
  className = '',
  cursorCharacter = '|',
}: TextTypeProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [delta, setDelta] = useState(typingSpeed);
  const cursorRef = useRef<HTMLSpanElement>(null);

  // Animasi Cursor Blink
  useEffect(() => {
    if (cursorRef.current) {
      gsap.to(cursorRef.current, {
        opacity: 0,
        repeat: -1,
        yoyo: true,
        duration: 0.5,
        ease: "power2.inOut"
      });
    }
  }, []);

  useEffect(() => {
    const texts = Array.isArray(text) ? text : [text];
    
    const ticker = setInterval(() => {
      const i = loopNum % texts.length;
      const fullText = texts[i];

      const updatedText = isDeleting 
        ? fullText.substring(0, displayedText.length - 1) 
        : fullText.substring(0, displayedText.length + 1);

      setDisplayedText(updatedText);

      if (isDeleting) {
        setDelta(deletingSpeed);
      } else {
        setDelta(typingSpeed);
      }

      if (!isDeleting && updatedText === fullText) {
        setIsDeleting(true);
        setDelta(pauseDuration); // Tunggu sebelum menghapus
      } else if (isDeleting && updatedText === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setDelta(500); // Tunggu sebelum ngetik kata baru
      } else {
        // Normal typing speed variasi dikit biar natural
         if(!isDeleting) setDelta(typingSpeed + Math.random() * 20);
      }

    }, delta);

    return () => clearInterval(ticker);
  }, [text, delta, isDeleting, loopNum, displayedText, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <div className={`inline-block ${className}`}>
      <span>{displayedText}</span>
      <span ref={cursorRef} className="ml-1 text-blue-400 font-bold">
        {cursorCharacter}
      </span>
    </div>
  );
};

export default TextType;