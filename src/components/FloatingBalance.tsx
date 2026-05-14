"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { selection } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { AnimatedNumber } from "./AnimatedNumber";

interface Props {
  total: number;
  scrollY: MotionValue<number>;
}

export function FloatingBalance({ total, scrollY }: Props) {
  const [hidden, setHidden] = useState(false);
  const scale = useTransform(scrollY, [0, 160], [1, 0.62]);
  const y = useTransform(scrollY, [0, 160], [0, -36]);

  return (
    <motion.section
      style={{ scale, y }}
      className="relative flex flex-col items-center pt-6 pb-2 origin-top"
    >
      <span className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
        Balance
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
            "******"
          ) : (
            <AnimatedNumber value={total} prefix="" duration={1.4} />
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
      <div className="mt-1 flex items-center gap-1.5">
        <span
          className="grid h-5 w-5 place-items-center rounded-full text-[8px] font-bold text-white"
          style={{ background: "#26A17B" }}
        >
          ₮
        </span>
        <span className="text-sm font-semibold text-slate-500">USDT</span>
      </div>
    </motion.section>
  );
}
