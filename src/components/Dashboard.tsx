"use client";

import { motion, useMotionValue } from "framer-motion";
import { Bell, Search, UserCircle2, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ASSETS, totalUsd, vibeCheck } from "@/lib/mockData";
import { isMuted, sounds, toggleMuted } from "@/lib/sounds";
import { selection } from "@/lib/haptics";
import { ActionButtons } from "./ActionButtons";
import { AssetRow } from "./AssetRow";
import { FloatingBalance } from "./FloatingBalance";
import { SkeletonRow } from "./SkeletonCard";
import { SwapModal } from "./SwapModal";
import { TabBar, type Tab } from "./TabBar";
import { VibeDiamond } from "./VibeDiamond";
import { VibeSendSheet } from "./VibeSendSheet";

const VIBE_STATUSES = [
  "Diamond Hands",
  "Steady Climber",
  "Ape In Mode",
  "Whale Mode",
  "Paper Hands",
  "HODL & Pray",
];

export function Dashboard() {
  const [tab, setTab] = useState<Tab>("wallet");
  const [swapOpen, setSwapOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(() =>
    typeof window === "undefined" ? false : isMuted(),
  );
  const [vibeIdx, setVibeIdx] = useState(0);
  const scrollY = useMotionValue(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Aggregate 24h change weighted by USD value
  const total = totalUsd();
  const change =
    ASSETS.reduce(
      (s, a) =>
        s +
        a.change24h *
          a.holdings.reduce((acc, h) => acc + h.usd, 0),
      0,
    ) / total;

  // Default vibe based on portfolio dynamics, cycled by tap.
  const baseVibe = vibeCheck(total, change).replace(/[^\w\s]/g, "").trim();
  const currentVibe = vibeIdx === 0 ? baseVibe : VIBE_STATUSES[vibeIdx];

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => scrollY.set(el.scrollTop);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollY]);

  return (
    <div className="relative z-10 mx-auto flex h-dvh max-w-md flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 pt-5">
        <button className="flex items-center gap-2 rounded-full glass px-2.5 py-1.5 active:scale-95 transition">
          <UserCircle2 size={20} className="text-slate-700" />
          <span className="text-xs font-medium text-slate-700">@usertgboth</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            aria-label={muted ? "Unmute UI sounds" : "Mute UI sounds"}
            onClick={() => {
              const next = toggleMuted();
              setMuted(next);
              if (!next) sounds.tap();
            }}
            className="grid h-9 w-9 place-items-center rounded-full glass active:scale-95 transition text-slate-700"
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button
            aria-label="Search"
            className="grid h-9 w-9 place-items-center rounded-full glass active:scale-95 transition text-slate-700"
          >
            <Search size={16} />
          </button>
          <button
            aria-label="Notifications"
            className="relative grid h-9 w-9 place-items-center rounded-full glass active:scale-95 transition text-slate-700"
          >
            <Bell size={16} />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#007aff]" />
          </button>
        </div>
      </header>

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        className="no-scrollbar flex-1 overflow-y-auto px-4 pb-32"
      >
        {tab === "wallet" && (
          <>
            <FloatingBalance total={total} change24h={change} scrollY={scrollY} />

            <div className="mt-5">
              <ActionButtons
                onSwap={() => {
                  sounds.open();
                  setSwapOpen(true);
                }}
                onSend={() => {
                  sounds.open();
                  setSendOpen(true);
                }}
                onReceive={() => {
                  sounds.open();
                  setSwapOpen(true);
                }}
                onBuy={() => {
                  sounds.open();
                  setSwapOpen(true);
                }}
              />
            </div>

            {/* Bento grid: Vibe + Referral */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  selection();
                  sounds.select();
                  setVibeIdx((i) => (i + 1) % VIBE_STATUSES.length);
                }}
                className="glass col-span-2 flex items-center gap-3 rounded-[28px] p-4 text-left"
              >
                <VibeDiamond size={48} />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                    Portfolio Vibe
                  </div>
                  <motion.div
                    key={currentVibe}
                    initial={{ y: 6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 320, damping: 26 }}
                    className="mt-1 truncate text-xl font-semibold tracking-tight"
                  >
                    {currentVibe}
                  </motion.div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Tap to cycle the vibe.
                  </p>
                </div>
              </motion.button>
              <motion.div
                whileTap={{ scale: 0.98 }}
                className="glass rounded-[28px] p-4 flex flex-col justify-between"
              >
                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                  Refer
                </div>
                <div>
                  <div className="text-xl font-semibold tabular-nums">+25%</div>
                  <div className="text-[10px] text-slate-500">of bro&apos;s fees</div>
                </div>
              </motion.div>
            </div>

            <div className="mt-5 flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold tracking-tight text-slate-700">
                Assets
              </h2>
              <button className="text-xs text-slate-500">Manage</button>
            </div>

            <ul className="mt-2 flex flex-col gap-2.5">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                : ASSETS.map((a, i) => (
                    <AssetRow
                      key={a.symbol}
                      asset={a}
                      index={i}
                      scrollY={scrollY}
                    />
                  ))}
            </ul>
          </>
        )}

        {tab === "swap" && (
          <Placeholder
            title="One-Tap Swap"
            description="Tap Swap on the wallet tab to open the liquid swap sheet."
            cta={() => {
              sounds.open();
              setSwapOpen(true);
            }}
          />
        )}
        {tab === "nfts" && (
          <Placeholder
            title="NFTs"
            description="Telegram Gifts & TON NFTs land here. Mock data placeholder."
          />
        )}
        {tab === "explore" && (
          <Placeholder
            title="Explore"
            description="DApps, airdrops and stake routes. Coming soon."
          />
        )}
      </div>

      <TabBar value={tab} onChange={setTab} />
      <SwapModal
        key={swapOpen ? "open" : "closed"}
        open={swapOpen}
        onClose={() => {
          sounds.close();
          setSwapOpen(false);
        }}
      />
      <VibeSendSheet
        key={sendOpen ? "send-open" : "send-closed"}
        open={sendOpen}
        onClose={() => setSendOpen(false)}
      />
    </div>
  );
}

function Placeholder({
  title,
  description,
  cta,
}: {
  title: string;
  description: string;
  cta?: () => void;
}) {
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <div className="glass-strong grid h-20 w-20 place-items-center rounded-[28px] text-3xl">
        ✦
      </div>
      <h3 className="mt-5 text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-slate-500">{description}</p>
      {cta && (
        <button
          onClick={cta}
          className="liquid-metal mt-6 rounded-2xl px-6 py-3 text-sm font-semibold text-white"
        >
          Open Swap
        </button>
      )}
    </div>
  );
}
