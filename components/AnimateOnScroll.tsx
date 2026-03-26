'use client';

import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';

interface AnimateOnScrollProps {
  children: React.ReactNode;
  variant?: 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scaleIn';
  delay?: number;
  duration?: number;
  threshold?: number;
}

const variants = {
  fadeUp: {
    hidden: { opacity: 0, transform: 'translateY(32px)' },
    visible: { opacity: 1, transform: 'translateY(0)' },
  },
  fadeIn: {
    hidden: { opacity: 0, transform: 'none' },
    visible: { opacity: 1, transform: 'none' },
  },
  slideLeft: {
    hidden: { opacity: 0, transform: 'translateX(-32px)' },
    visible: { opacity: 1, transform: 'translateX(0)' },
  },
  slideRight: {
    hidden: { opacity: 0, transform: 'translateX(32px)' },
    visible: { opacity: 1, transform: 'translateX(0)' },
  },
  scaleIn: {
    hidden: { opacity: 0, transform: 'scale(0.95)' },
    visible: { opacity: 1, transform: 'scale(1)' },
  },
};

export default function AnimateOnScroll({
  children,
  variant = 'fadeUp',
  delay = 0,
  duration = 0.6,
  threshold = 0.15,
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  const v = variants[variant];

  return (
    <Box
      ref={ref}
      sx={{
        opacity: isVisible ? v.visible.opacity : v.hidden.opacity,
        transform: isVisible ? v.visible.transform : v.hidden.transform,
        transition: `opacity ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </Box>
  );
}
