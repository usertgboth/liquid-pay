"use client";

import { useEffect, useRef } from "react";

/**
 * Procedural starfield rendered to a canvas pinned behind the UI.
 * - Two parallax layers (slow, fast) with subtle twinkle.
 * - Three brand-tinted "nebula" blobs that drift slowly:
 *     TON blue, USDT green, SOL violet — these are the only colors.
 * - Resolution-aware (DPR), pauses when tab is hidden.
 */
export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = window.innerWidth;
    let h = window.innerHeight;
    let visible = true;

    function resize() {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    type Star = {
      x: number;
      y: number;
      r: number;
      speed: number;
      phase: number;
      layer: 0 | 1;
    };
    const stars: Star[] = [];
    const STAR_COUNT = Math.min(180, Math.floor((w * h) / 9000));
    for (let i = 0; i < STAR_COUNT; i++) {
      const layer = Math.random() > 0.65 ? 1 : 0;
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: layer === 1 ? Math.random() * 1.4 + 0.4 : Math.random() * 0.8 + 0.2,
        speed: layer === 1 ? 0.04 : 0.015,
        phase: Math.random() * Math.PI * 2,
        layer,
      });
    }

    const blobs = [
      // Soft sky tints — drift gently behind the glass UI.
      { color: "rgba(120, 175, 250, 0.45)", x: 0.18, y: 0.22, r: 0.55, sp: 0.00007, ph: 0 },
      { color: "rgba(150, 200, 255, 0.4)", x: 0.82, y: 0.36, r: 0.5, sp: 0.00009, ph: 1.2 },
      { color: "rgba(180, 210, 255, 0.4)", x: 0.5, y: 0.88, r: 0.6, sp: 0.00006, ph: 2.4 },
    ];

    function draw(t: number) {
      if (!visible) {
        raf = requestAnimationFrame(draw);
        return;
      }
      ctx?.clearRect(0, 0, w, h);

      // Soft inverted vignette: brighten center on a light bg.
      const vg = ctx!.createRadialGradient(
        w * 0.5,
        h * 0.45,
        Math.min(w, h) * 0.12,
        w * 0.5,
        h * 0.45,
        Math.max(w, h) * 0.85,
      );
      vg.addColorStop(0, "rgba(255, 255, 255, 0.18)");
      vg.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx!.fillStyle = vg;
      ctx!.fillRect(0, 0, w, h);

      // Sky tint blobs (multiply for soft tint on light bg).
      ctx!.globalCompositeOperation = "multiply";
      for (const b of blobs) {
        const dx = Math.sin(t * b.sp + b.ph) * 60;
        const dy = Math.cos(t * b.sp * 0.8 + b.ph) * 40;
        const cx = b.x * w + dx;
        const cy = b.y * h + dy;
        const r = Math.min(w, h) * b.r;
        const g = ctx!.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, b.color);
        g.addColorStop(0.6, "rgba(0,0,0,0)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(cx, cy, r, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalCompositeOperation = "source-over";

      // Faint blue sparkle dots floating across the sky.
      ctx!.globalCompositeOperation = "source-over";
      for (const s of stars) {
        s.x -= s.speed;
        if (s.x < -2) s.x = w + 2;
        const tw = 0.6 + 0.4 * Math.sin(t * 0.001 + s.phase);
        const alpha = (s.layer === 1 ? 0.4 : 0.18) * tw;
        ctx!.fillStyle = `rgba(60, 110, 200, ${alpha})`;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fill();
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    function onVis() {
      visible = !document.hidden;
    }
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
