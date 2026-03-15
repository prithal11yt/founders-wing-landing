'use client';

import React, { useEffect, useRef } from 'react';

export function CyberpunkGrid() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const relativeX = (x / rect.width) * 2 - 1;
      const relativeY = (y / rect.height) * 2 - 1;
      
      // Update CSS variables for perspective shift
      containerRef.current.style.setProperty('--mouse-x', `${relativeX * 15}deg`);
      containerRef.current.style.setProperty('--mouse-y', `${relativeY * -10}deg`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-x-0 bottom-0 h-[80vh] overflow-hidden pointer-events-none z-0"
      style={{
        perspective: '1000px',
        // Mask it so it fades out as it goes up the screen
        maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
        WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
      }}
    >
      <div 
        className="absolute w-[200vw] h-[200vh] left-[-50vw] top-[20%]"
        style={{
          transform: `rotateX(65deg) rotateY(var(--mouse-x, 0deg)) rotateZ(0deg)`,
          transformOrigin: 'top center',
          transition: 'transform 0.3s ease-out',
        }}
      >
        {/* The Grid lines */}
        <div 
          className="absolute inset-0 animate-grid-flow"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(14, 165, 233, 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(14, 165, 233, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px', // Size of grid squares
          }}
        />

        {/* Thicker main crossing axes */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-[2px] bg-accent-cyan shadow-[0_0_15px_rgba(14,165,233,0.8)] opacity-40"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-full w-[2px] bg-accent-cyan shadow-[0_0_15px_rgba(14,165,233,0.8)] opacity-40"></div>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes grid-flow {
            0% {
              transform: translateY(0);
            }
            100% {
              transform: translateY(80px); /* Must match backgroundSize Y */
            }
          }
          .animate-grid-flow {
            animation: grid-flow 2s linear infinite;
          }
        `}} />
      </div>

      {/* Horizon Glow */}
      <div className="absolute top-[20%] left-0 right-0 h-[200px] bg-accent-cyan opacity-[0.15] blur-[80px]"></div>
    </div>
  );
}
