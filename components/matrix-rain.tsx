'use client';

import React, { useEffect, useRef } from 'react';

export function MatrixDataRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Characters commonly used in modern data-rain effects (Katakana + Latin + Numbers)
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレゲゼデベペオォコソトノホモヨョロゴゾドボポヴッン@#$%&*';
    const numChars = charset.length;
    
    // Matrix configuration
    const fontSize = 14;
    let columns = 0;
    let drops: number[] = [];

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight * 1.2;
      
      columns = Math.floor(canvas.width / fontSize);
      drops = [];
      
      // Initialize drops at random y positions above the screen
      for (let x = 0; x < columns; x++) {
        drops[x] = (Math.random() * -100); 
      }
    };

    const draw = () => {
      // 1. Draw a semi-transparent black background to create the "fading tail" effect
      ctx.fillStyle = 'rgba(251, 252, 253, 0.08)'; // Your background color with opacity for tail fading
      // For a dark mode we would use a dark color. Since it looks like your app has a light/gradient background
      // by default, we'll use a very subtle fade color so that it blends nicely.
      // If the page is light, we can fade with white/light gray. If dark, fade with dark.
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;
      
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = charset[Math.floor(Math.random() * numChars)];

        // Randomize opacity slightly for a twinkling effect
        const randomOpacity = Math.random() * 0.5 + 0.1;
        // Deep cyan color matching your theme
        ctx.fillStyle = `rgba(14, 165, 233, ${randomOpacity})`; 

        // Draw the character
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset the drop to the top randomly to keep the rain continuous
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Move the drop down
        drops[i]++;
      }

      // Throttle framerate for that classic matrix stutter
      setTimeout(() => {
          animationFrameId = requestAnimationFrame(draw);
      }, 50); 
    };

    const handleResize = () => {
      init();
    };

    init();
    draw();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{
        // Use a mask so the rain fades out at the edges and doesn't clutter the bottom text
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
        opacity: 0.15, // Keep it very subtle!
        mixBlendMode: 'multiply' // Blend cleanly into the light background
      }}
    />
  );
}
