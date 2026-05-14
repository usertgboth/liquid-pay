"use client";

import { motion } from "framer-motion";

/**
 * Animated diamond emblem with rotating laser rays around it.
 * Pure SVG, no external assets. Rays rotate slowly; diamond gently breathes.
 */
export function VibeDiamond({ size = 44 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="relative grid place-items-center"
    >
      {/* Rotating laser rays */}
      <motion.svg
        viewBox="-50 -50 100 100"
        width={size * 1.6}
        height={size * 1.6}
        className="absolute"
        animate={{ rotate: 360 }}
        transition={{ duration: 18, ease: "linear", repeat: Infinity }}
        aria-hidden
      >
        <defs>
          <linearGradient id="rayGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0, 122, 255, 0.0)" />
            <stop offset="50%" stopColor="rgba(0, 122, 255, 0.65)" />
            <stop offset="100%" stopColor="rgba(0, 122, 255, 0.0)" />
          </linearGradient>
        </defs>
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 360) / 8;
          return (
            <line
              key={i}
              x1="0"
              y1="-46"
              x2="0"
              y2="-26"
              stroke="url(#rayGrad)"
              strokeWidth={i % 2 === 0 ? 1.4 : 0.8}
              strokeLinecap="round"
              transform={`rotate(${angle})`}
              opacity={i % 2 === 0 ? 0.9 : 0.55}
            />
          );
        })}
      </motion.svg>

      {/* Counter-rotating subtle ring */}
      <motion.span
        className="absolute h-[140%] w-[140%] rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(0,122,255,0.0) 0deg, rgba(0,122,255,0.32) 90deg, rgba(0,122,255,0.0) 180deg, rgba(0,122,255,0.22) 270deg, rgba(0,122,255,0.0) 360deg)",
          filter: "blur(4px)",
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 22, ease: "linear", repeat: Infinity }}
      />

      {/* Diamond body */}
      <motion.svg
        viewBox="-50 -50 100 100"
        width={size}
        height={size}
        className="relative"
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 4.2, ease: "easeInOut", repeat: Infinity }}
      >
        <defs>
          <linearGradient id="diaFace" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#dceaff" />
            <stop offset="55%" stopColor="#5cb0ff" />
            <stop offset="100%" stopColor="#0a5fd6" />
          </linearGradient>
          <linearGradient id="diaTop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#a7c8ff" />
          </linearGradient>
        </defs>
        {/* Top facet */}
        <polygon
          points="-32,-12 32,-12 18,-30 -18,-30"
          fill="url(#diaTop)"
          opacity="0.95"
        />
        {/* Body */}
        <polygon
          points="-32,-12 32,-12 0,32"
          fill="url(#diaFace)"
        />
        {/* Inner highlight */}
        <polygon
          points="-32,-12 -10,-12 -16,8"
          fill="rgba(255,255,255,0.45)"
        />
        {/* Top sparkle */}
        <circle cx="-8" cy="-22" r="2" fill="#ffffff" opacity="0.85" />
      </motion.svg>
    </div>
  );
}
