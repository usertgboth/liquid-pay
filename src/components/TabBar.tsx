"use client";

import { motion } from "framer-motion";
import { Compass, Image as ImgIcon, Repeat2, Wallet } from "lucide-react";
import { selection } from "@/lib/haptics";

export type Tab = "wallet" | "swap" | "nfts" | "explore";

interface Props {
  value: Tab;
  onChange: (t: Tab) => void;
}

const TABS: { id: Tab; label: string; Icon: typeof Wallet }[] = [
  { id: "wallet", label: "Wallet", Icon: Wallet },
  { id: "swap", label: "Swap", Icon: Repeat2 },
  { id: "nfts", label: "NFTs", Icon: ImgIcon },
  { id: "explore", label: "Explore", Icon: Compass },
];

export function TabBar({ value, onChange }: Props) {
  return (
    <nav className="fixed inset-x-0 bottom-3 z-30 flex justify-center px-4">
      <div className="glass-strong relative flex w-full max-w-md items-center justify-between rounded-[28px] px-2 py-2">
        {TABS.map(({ id, label, Icon }) => {
          const active = id === value;
          return (
            <button
              key={id}
              onClick={() => {
                selection();
                onChange(id);
              }}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-1.5"
            >
              {active && (
                <motion.span
                  layoutId="tabPill"
                  className="absolute inset-x-2 inset-y-0 -z-0 rounded-2xl"
                  style={{
                    background:
                      "linear-gradient(135deg, #5cb0ff 0%, #007aff 60%, #0a5fd6 100%)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.6), 0 6px 18px -8px rgba(0,122,255,0.55)",
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                size={20}
                strokeWidth={active ? 2.4 : 2}
                className={`relative z-10 ${active ? "text-white" : "text-slate-500"}`}
              />
              <span
                className={`relative z-10 text-[10px] font-medium ${
                  active ? "text-white" : "text-slate-500"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
