"use client";

import { motion } from "framer-motion";
import { ArrowDownToLine, ArrowUpFromLine, Repeat2, Wallet } from "lucide-react";
import type React from "react";
import { impact } from "@/lib/haptics";

interface Props {
  onSwap: () => void;
  onSend: () => void;
  onReceive: () => void;
  onDeposit: () => void;
}

interface Action {
  key: string;
  label: string;
  Icon: typeof ArrowUpFromLine;
  onClick: () => void;
  liquid?: boolean;
  halo: string;
}

export function ActionButtons({ onSwap, onSend, onReceive, onDeposit }: Props) {
  const actions: Action[] = [
    {
      key: "deposit",
      label: "Deposit",
      Icon: Wallet,
      onClick: onDeposit,
      liquid: true,
      halo: "rgba(38, 161, 123, 0.55)",
    },
    {
      key: "send",
      label: "Send",
      Icon: ArrowUpFromLine,
      onClick: onSend,
      halo: "rgba(220, 230, 255, 0.55)",
    },
    {
      key: "receive",
      label: "Receive",
      Icon: ArrowDownToLine,
      onClick: onReceive,
      halo: "rgba(38, 161, 123, 0.55)",
    },
    {
      key: "swap",
      label: "Swap",
      Icon: Repeat2,
      onClick: onSwap,
      halo: "rgba(140, 170, 230, 0.55)",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 px-1">
      {actions.map(({ key, label, Icon, onClick, liquid, halo }) => (
        <motion.button
          key={key}
          whileTap={{ scale: 0.92 }}
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
          onClick={() => {
            impact("medium");
            onClick();
          }}
          className="group relative flex flex-col items-center gap-2"
        >
          <div
            className={`action-glow relative grid h-14 w-14 place-items-center rounded-[22px] ${
              liquid ? "liquid-metal" : "glass"
            }`}
            style={{ "--halo": halo } as React.CSSProperties}
          >
            <Icon
              size={22}
              strokeWidth={2.4}
              className={liquid ? "text-white drop-shadow-sm" : "text-slate-700"}
            />
            {liquid && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[22px] opacity-60 mix-blend-overlay"
                style={{
                  background:
                    "radial-gradient(80% 80% at 30% 20%, rgba(255,255,255,0.6), transparent 60%)",
                }}
              />
            )}
          </div>
          <span className="text-[11px] font-medium text-slate-700">
            {label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
