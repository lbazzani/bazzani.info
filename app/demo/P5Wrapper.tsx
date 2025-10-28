'use client';

import React, { useRef, useEffect } from 'react';
import p5 from 'p5';

interface P5WrapperProps {
  sketch: (p5: p5) => void;
}

export default function P5Wrapper({ sketch }: P5WrapperProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  useEffect(() => {
    // Cleanup dell'istanza precedente se esiste
    if (p5InstanceRef.current) {
      try {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      } catch (e) {
        console.warn('Error removing p5 instance:', e);
      }
    }

    // Crea nuova istanza solo se il container è montato
    if (containerRef.current) {
      // Breve delay per assicurarsi che il cleanup sia completato
      const timer = setTimeout(() => {
        if (containerRef.current) {
          p5InstanceRef.current = new p5(sketch, containerRef.current);
        }
      }, 50);

      return () => {
        clearTimeout(timer);
        if (p5InstanceRef.current) {
          try {
            p5InstanceRef.current.remove();
            p5InstanceRef.current = null;
          } catch (e) {
            console.warn('Error in cleanup:', e);
          }
        }
      };
    }
  }, [sketch]);

  // Cleanup finale quando il componente viene smontato
  useEffect(() => {
    return () => {
      if (p5InstanceRef.current) {
        try {
          p5InstanceRef.current.remove();
          p5InstanceRef.current = null;
        } catch (e) {
          console.warn('Error in final cleanup:', e);
        }
      }
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
