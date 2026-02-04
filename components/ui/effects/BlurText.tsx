'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState, useMemo } from 'react';

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'characters';
  direction?: 'top' | 'bottom';
  onAnimationComplete?: () => void;
}

export default function BlurText({
  text = '',
  delay = 100,
  className = '',
  animateBy = 'words',
  direction = 'top',
  onAnimationComplete
}: BlurTextProps) {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const initialState = useMemo(
    () =>
      direction === 'top'
        ? { filter: 'blur(10px)', opacity: 0, y: -30 }
        : { filter: 'blur(10px)', opacity: 0, y: 30 },
    [direction]
  );

  const animateState = useMemo(
    () => ({ filter: 'blur(0px)', opacity: 1, y: 0 }),
    []
  );

  return (
    <span ref={ref} className={className} style={{ display: 'inline-flex', flexWrap: 'wrap' }}>
      {elements.map((segment, index) => (
        <motion.span
          style={{ display: 'inline-block', willChange: 'transform, filter, opacity' }}
          key={index}
          initial={initialState}
          animate={inView ? animateState : initialState}
          transition={{
            duration: 0.5,
            delay: (index * delay) / 1000,
            ease: 'easeOut'
          }}
          onAnimationComplete={index === elements.length - 1 ? onAnimationComplete : undefined}
        >
          {segment === ' ' ? '\u00A0' : segment}
          {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
        </motion.span>
      ))}
    </span>
  );
}
