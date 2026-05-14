"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { selection } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { AnimatedNumber } from "./AnimatedNumber";

interface Props {
  total: number;
  change24h: number;
  scrollY: MotionValue<number>;
}

export function FloatingBalance({ total, change24h, scrollY }: Props) {
  const [hidden, setHidden] = useState(false);
  const [shownTotal, setShownTotal] = useState(total);
  const scale = useTransform(scrollY, [0, 160], [1, 0.62]);
  const y = useTransform(scrollY, [0, 160], [0, -36]);
  const opacityVibe = useTransform(scrollY, [0, 80], [1, 0]);

  // Simulate live cross-chain balance updates with very small jitter so the
  // tabular-nums digits actually flow.
  useEffect(() => {
    const id = setInterval(() => {
      const jitter = (Math.random() - 0.5) * total * 0.0009;
      setShownTotal((v) => {
        const target = total + jitter;
        // ease toward target so we never drift far from base
        return v + (target - v) * 0.6;
      });
    }, 2200);
    return () => clearInterval(id);
  }, [total]);

  const positive = change24h >= 0;

  return (
    <motion.section
      style={{ scale, y }}
      className="relative flex flex-col items-center pt-6 pb-2 origin-top"
    >
      <span className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
        Total Balance
      </span>
      <div className="flex items-end gap-2">
        <motion.h1
          layout
          className="text-[56px] font-semibold leading-none tracking-tight"
          style={{
            fontVariantNumeric: "tabular-nums",
            background:
              "linear-gradient(180deg, #0b1325 0%, #1a3a78 60%, #007aff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {hidden ? (
            "••••••"
          ) : (
            <AnimatedNumber value={shownTotal} prefix="$" duration={1.4} />
          )}
        </motion.h1>
        <button
          onClick={() => {
            selection();
            sounds.tap();
            setHidden((v) => !v);
          }}
          className="mb-3 grid h-7 w-7 place-items-center rounded-full glass active:scale-95 transition"
          aria-label={hidden ? "Show balance" : "Hide balance"}
        >
          {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>

      <motion.div
        style={{ opacity: opacityVibe }}
        className="mt-3 flex items-center gap-2"
      >
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium tabular-nums ${
            positive ? "text-emerald-600" : "text-rose-600"
          } glass`}
        >
          {positive ? "+" : ""}
          {change24h.toFixed(2)}% · 24h
        </span>
      </motion.div>
    </motion.section>
  );
}
