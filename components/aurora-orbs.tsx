'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export function AuroraOrbs({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate relative position (-1 to 1)
      const relativeX = (x / rect.width) * 2 - 1;
      const relativeY = (y / rect.height) * 2 - 1;
      
      mouseRef.current = { x: relativeX, y: relativeY };
      
      // Update variables so CSS calc() works
      containerRef.current.style.setProperty('--mouse-x', relativeX.toString());
      containerRef.current.style.setProperty('--mouse-y', relativeY.toString());
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={cn("absolute inset-0 overflow-hidden pointer-events-none z-0", className)}
    >
      {/* 
        Heavy blur layer to create the "aurora" effect.
      */}
      <div className="absolute inset-0 opacity-80" style={{ filter: 'blur(80px)' }}>
        
        {/* Orb 1: Primary Cyan (Top Left drifting to Center) */}
        <div 
          className="absolute rounded-full pointer-events-none animate-orb-float-1"
          style={{
            background: 'radial-gradient(circle at center, rgba(14, 165, 233, 0.4) 0%, rgba(14, 165, 233, 0) 70%)',
            width: '60vw',
            height: '60vw',
            maxWidth: '800px',
            maxHeight: '800px',
            top: '-10%',
            left: '-10%',
            transform: 'translate(calc(var(--mouse-x, 0) * 10px), calc(var(--mouse-y, 0) * 10px))',
            transition: 'transform 0.5s ease-out'
          }} 
        />
        
        {/* Orb 2: Deep Purple/Indigo (Bottom Right drifting) */}
        <div 
          className="absolute rounded-full pointer-events-none animate-orb-float-2"
          style={{
            background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.25) 0%, rgba(139, 92, 246, 0) 70%)',
            width: '70vw',
            height: '70vw',
            maxWidth: '900px',
            maxHeight: '900px',
            bottom: '-20%',
            right: '-10%',
            transform: 'translate(calc(var(--mouse-x, 0) * -15px), calc(var(--mouse-y, 0) * -15px))',
            transition: 'transform 0.6s ease-out'
          }} 
        />

        {/* Orb 3: Very faint Emerald (Center drifting) */}
        <div 
          className="absolute rounded-full pointer-events-none animate-orb-float-3"
          style={{
            background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0) 70%)',
            width: '50vw',
            height: '50vw',
            maxWidth: '600px',
            maxHeight: '600px',
            top: '30%',
            left: '30%',
            transform: 'translate(calc(var(--mouse-x, 0) * 20px), calc(var(--mouse-y, 0) * -5px))',
            transition: 'transform 0.8s ease-out'
          }} 
        />
      </div>

      {/* Global styles for the keyframes if tailwind arbitrary values aren't enough */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes orb-float-1 {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(5%, 5%) scale(1.05); }
          66% { transform: translate(-2%, 8%) scale(0.95); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes orb-float-2 {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-6%, -4%) scale(0.95); }
          66% { transform: translate(4%, -8%) scale(1.05); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes orb-float-3 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(8%, -2%) scale(1.1); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .animate-orb-float-1 { animation: orb-float-1 20s ease-in-out infinite; }
        .animate-orb-float-2 { animation: orb-float-2 25s ease-in-out infinite reverse; }
        .animate-orb-float-3 { animation: orb-float-3 15s ease-in-out infinite; }
      `}} />
    </div>
  );
}
