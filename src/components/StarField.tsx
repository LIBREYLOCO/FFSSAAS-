"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;       // fraction 0..1
  y: number;       // fraction 0..1
  r: number;
  baseOpacity: number;
  phase: number;
  speed: number;
}

interface Bokeh {
  x: number;
  y: number;
  r: number;
  opacity: number;
  vx: number;
  vy: number;
  color: string;
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function rgba(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let frame = 0;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener("resize", setSize);

    // ── Stars ──────────────────────────────────────────────────────
    const stars: Star[] = Array.from({ length: 220 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.3 + 0.2,
      baseOpacity: Math.random() * 0.55 + 0.12,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.014 + 0.003,
    }));

    // ── Bokeh orbs (soft candlelight / memorial light) ─────────────
    const GOLD = "#c5a059";
    const WARM = "#e8a060";
    const BLUE = "#3d6b9e";

    const bokeh: Bokeh[] = Array.from({ length: 14 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 130 + 50,
      opacity: Math.random() * 0.06 + 0.012,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.1,
      color: i < 8 ? (Math.random() > 0.5 ? GOLD : WARM) : BLUE,
    }));

    // ── Draw loop ──────────────────────────────────────────────────
    const draw = () => {
      frame++;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Bokeh
      for (const b of bokeh) {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < -b.r) b.x = W + b.r;
        if (b.x > W + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = H + b.r;
        if (b.y > H + b.r) b.y = -b.r;

        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0,   rgba(b.color, b.opacity));
        g.addColorStop(0.5, rgba(b.color, b.opacity * 0.45));
        g.addColorStop(1,   "transparent");
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }

      // Stars
      for (const s of stars) {
        const twinkle = Math.sin(frame * s.speed + s.phase);
        const opacity = s.baseOpacity * (0.62 + 0.38 * twinkle);
        const x = s.x * W;
        const y = s.y * H;

        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,240,210,${opacity})`;
        ctx.fill();

        // Glow halo on the bigger stars
        if (s.r > 0.85) {
          const halo = ctx.createRadialGradient(x, y, 0, x, y, s.r * 6);
          halo.addColorStop(0, rgba(GOLD, opacity * 0.22));
          halo.addColorStop(1, "transparent");
          ctx.beginPath();
          ctx.arc(x, y, s.r * 6, 0, Math.PI * 2);
          ctx.fillStyle = halo;
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", setSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -5 }}
      aria-hidden="true"
    />
  );
}
