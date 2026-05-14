"use client";

import { motion } from "framer-motion";
import { CHAINS, type ChainId } from "@/lib/mockData";

interface Props {
  chains: ChainId[];
  spinning?: boolean;
}

/**
 * Stacked, glassy chain logos. When `spinning` is true (e.g. on tap),
 * each badge spins on its own axis with a slight stagger.
 */
export function ChainBadgeStack({ chains, spinning }: Props) {
  const visible = chains.slice(0, 4);
  const overflow = Math.max(0, chains.length - visible.length);

  return (
    <div className="flex items-center -space-x-1.5">
      {visible.map((c, i) => {
        const meta = CHAINS[c];
        return (
          <motion.span
            key={c}
            initial={false}
            animate={
              spinning
                ? {
                    rotateY: [0, 180, 360],
                    scale: [1, 1.08, 1],
                  }
                : { rotateY: 0, scale: 1 }
            }
            transition={{
              duration: 0.9,
              ease: "easeInOut",
              delay: i * 0.06,
            }}
            style={{
              background: `linear-gradient(180deg, rgba(255,255,255,0.95) 0%, ${meta.color}25 100%)`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.9), inset 0 0 0 1px ${meta.color}66, 0 4px 10px -4px ${meta.color}99`,
              color: meta.color,
              transformStyle: "preserve-3d",
            }}
            className="relative grid h-5 w-5 place-items-center rounded-full text-[8px] font-bold"
          >
            {meta.short.slice(0, 3)}
          </motion.span>
        );
      })}
      {overflow > 0 && (
        <span className="grid h-5 w-5 place-items-center rounded-full bg-slate-900/10 text-[8px] font-bold text-slate-700">
          +{overflow}
        </span>
      )}
    </div>
  );
}
