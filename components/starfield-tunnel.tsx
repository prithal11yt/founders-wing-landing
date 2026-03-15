'use client';

import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
}

export function StarfieldTunnel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let stars: Star[] = [];
    let animationFrameId: number;
    let centerUpdateId: number;
    let centerX = 0;
    let centerY = 0;
    let targetCenterX = 0;
    let targetCenterY = 0;
    let speed = 4; // Warp speed

    const numStars = 600;

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight * 1.5; // Cover more of the page
      centerX = canvas.width / 2;
      centerY = canvas.height / 2;
      targetCenterX = centerX;
      targetCenterY = centerY;
      
      stars = [];
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width * 4 - canvas.width * 2,
          y: Math.random() * canvas.height * 4 - canvas.height * 2,
          z: Math.random() * 2000,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < numStars; i++) {
        const star = stars[i];

        star.z -= speed;

        if (star.z <= 0) {
          star.x = Math.random() * canvas.width * 4 - canvas.width * 2;
          star.y = Math.random() * canvas.height * 4 - canvas.height * 2;
          star.z = 2000;
        }

        // Calculate mapped coordinates
        const x = centerX + (star.x / star.z) * 1000;
        const y = centerY + (star.y / star.z) * 1000;

        // Skip drawing if outside canvas
        if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
            continue;
        }

        // Perspective size
        const size = Math.max(0.1, 1500 / star.z);
        // Alpha fades in as it gets closer
        const alpha = Math.min(1, Math.max(0, 1 - star.z / 2000));

        // Let's create a cool stretch effect (warp trail)
        const prevZ = star.z + speed * 2;
        const prevX = centerX + (star.x / prevZ) * 1000;
        const prevY = centerY + (star.y / prevZ) * 1000;

        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        // Using accent-cyan
        ctx.strokeStyle = `rgba(14, 165, 233, ${alpha})`;
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(draw);
    };
    
    const handleMouseMove = (e: MouseEvent) => {
        // Shift center slightly opposite to mouse to simulate looking around
        const mX = e.clientX - window.innerWidth / 2;
        const mY = e.clientY - window.innerHeight / 2;
        targetCenterX = canvas.width / 2 - mX * 0.15;
        targetCenterY = canvas.height / 2 - mY * 0.15;
    };

    const updateCenter = () => {
        centerX += (targetCenterX - centerX) * 0.05;
        centerY += (targetCenterY - centerY) * 0.05;
        centerUpdateId = requestAnimationFrame(updateCenter);
    }

    const handleResize = () => {
      init();
    };

    init();
    draw();
    updateCenter();

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      cancelAnimationFrame(centerUpdateId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ opacity: 0.8 }} 
    />
  );
}
