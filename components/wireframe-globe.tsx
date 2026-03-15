'use client';

import React, { useEffect, useRef } from 'react';

export function WireframeGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Globe configuration
    const numPoints = 600;
    const radius = 350; // Globe size
    
    // Core parameters
    let points: { x: number; y: number; z: number }[] = [];
    let rotation = { x: 0, y: 0 };
    let targetRotation = { x: 0, y: 0.002 }; // Constant slow spin on Y axis
    let mouseX = 0;
    let mouseY = 0;

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight * 1.2;
      
      points = [];
      const phi = Math.PI * (3 - Math.sqrt(5)); // Fibonacci angle
      
      // Fibonacci sphere distribution
      for (let i = 0; i < numPoints; i++) {
        const y = 1 - (i / (numPoints - 1)) * 2; // y goes from 1 to -1
        const r = Math.sqrt(1 - y * y); // radius at y
        
        const theta = phi * i; // golden angle increment
        
        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;
        
        // Scale by radius
        points.push({ x: x * radius, y: y * radius, z: z * radius });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Center position
      // Position slightly to the right so it doesn't block the main text directly
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Smooth rotation toward target
      rotation.x += (targetRotation.x - rotation.x) * 0.05;
      
      // Keep slow y rotation going, heavily influenced by mouse X
      const slowSpinY = 0.001; 
      targetRotation.y += slowSpinY;
      rotation.y += (targetRotation.y - rotation.y) * 0.1;

      // Project points
      const projectedPoints = points.map(point => {
        // Rotate X
        const cosX = Math.cos(rotation.x);
        const sinX = Math.sin(rotation.x);
        const y1 = point.y * cosX - point.z * sinX;
        const z1 = point.y * sinX + point.z * cosX;
        
        // Rotate Y
        const cosY = Math.cos(rotation.y);
        const sinY = Math.sin(rotation.y);
        const x2 = point.x * cosY + z1 * sinY;
        const z2 = -point.x * sinY + z1 * cosY;
        
        // 3D to 2D Perspective Projection
        const fov = 1000;
        const z3 = fov / (fov + z2);
        
        const px = x2 * z3 + cx;
        const py = y1 * z3 + cy;
        
        return { px, py, z: z2, originalPoint: point };
      });
      
      // Sort points by z depth to draw back ones first
      projectedPoints.sort((a, b) => b.z - a.z);

      // Draw lines between nearby points (Wireframe effect)
      // Only draw for front-facing points to reduce visual clutter
      ctx.beginPath();
      for (let i = 0; i < projectedPoints.length; i++) {
        const p1 = projectedPoints[i];
        
        // Only draw full connections for points near the front
        if (p1.z > 50) continue; 
        
        // Find closest points to connect
        let connects = 0;
        for (let j = i + 1; j < projectedPoints.length && connects < 3; j++) {
            const p2 = projectedPoints[j];
            if (p2.z > 50) continue; // Skip back hemisphere
            
            const dx = p1.originalPoint.x - p2.originalPoint.x;
            const dy = p1.originalPoint.y - p2.originalPoint.y;
            const dz = p1.originalPoint.z - p2.originalPoint.z;
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
            
            // If points are physically close in 3D space, connect them
            if (dist < radius * 0.3) {
                ctx.moveTo(p1.px, p1.py);
                ctx.lineTo(p2.px, p2.py);
                connects++;
            }
        }
      }
      
      // Faded cyan lines
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw the nodes
      projectedPoints.forEach(p => {
        // Calculate size and opacity based on Z depth
        const scale = (radius + p.z) / (radius * 2); // 0 to 1
        // Invert scale for perspective (closer = smaller Z value, so we map differently)
        const size = Math.max(0.5, (1 - (p.z / radius)) * 2);
        const opacity = Math.max(0.1, 1 - (p.z / radius));
        
        ctx.beginPath();
        ctx.arc(p.px, p.py, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(14, 165, 233, ${opacity * 0.8})`;
        ctx.fill();
        
        // Draw occasional bright "hotspots"
        if (Math.random() > 0.995 && p.z < 0) {
            ctx.beginPath();
            ctx.arc(p.px, p.py, size * 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Map mouse position to rotation completely
      const xMulti = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
      const yMulti = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1
      
      // Target rotation shifts based on mouse
      targetRotation.x = yMulti * 0.5; // Up/down tilts globe
      targetRotation.y += xMulti * 0.05; // Left/right spins globe faster
    };

    const handleResize = () => {
      init();
    };

    init();
    draw();

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
      // Masking the edges so the globe fades cleanly into the background
      style={{
        maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 70%)',
        opacity: 0.7,
      }}
    />
  );
}
