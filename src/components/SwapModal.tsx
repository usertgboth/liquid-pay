"use client";

import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { ArrowDown, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { impact, notify, selection } from "@/lib/haptics";
import { ASSETS, type AssetGroup, assetTotal } from "@/lib/mockData";
import { AssetIcon } from "./AssetIcon";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Phase = "idle" | "loading" | "done";

export function SwapModal({ open, onClose }: Props) {
  const [from, setFrom] = useState<AssetGroup>(ASSETS[0]);
  const [to, setTo] = useState<AssetGroup>(ASSETS[1]);
  const [amount, setAmount] = useState("100");
  const [phase, setPhase] = useState<Phase>("idle");
  const [route, setRoute] = useState("Li.Fi");

  const fromValueUsd = useMemo(() => {
    const a = parseFloat(amount || "0") || 0;
    return a * from.price;
  }, [amount, from.price]);
  const toAmount = useMemo(
    () => (to.price > 0 ? fromValueUsd / to.price : 0),
    [fromValueUsd, to.price],
  );

  function flip() {
    selection();
    const f = from;
    setFrom(to);
    setTo(f);
  }

  async function execute() {
    impact("heavy");
    setRoute(Math.random() > 0.5 ? "Li.Fi" : "Ston.fi");
    setPhase("loading");
    await new Promise((r) => setTimeout(r, 1400));
    setPhase("done");
    notify("success");
    confetti({
      particleCount: 140,
      spread: 80,
      startVelocity: 45,
      origin: { y: 0.6 },
      colors: ["#007aff", "#5cb0ff", "#a7c8ff", "#ffffff"],
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/30 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(238,243,251,0.95) 100%)",
              backdropFilter: "blur(40px) saturate(180%)",
              WebkitBackdropFilter: "blur(40px) saturate(180%)",
            }}
            className="relative w-full max-w-md rounded-t-[36px] px-5 pt-3 pb-8 border-t border-x border-white/95 shadow-[0_-30px_80px_-20px_rgba(20,50,110,0.25)] text-slate-900"
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-300" />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">
                Bridge & Swap
              </h2>
              <button
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-full glass"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <SwapSide
              label="You pay"
              asset={from}
              amount={amount}
              onAmountChange={setAmount}
              onAssetClick={() => cycle(from, setFrom, to)}
            />

            <div className="relative my-2 flex justify-center">
              <button
                onClick={flip}
                className="grid h-10 w-10 place-items-center rounded-full glass-strong active:scale-90 transition"
                aria-label="Flip direction"
              >
                <ArrowDown size={16} />
              </button>
            </div>

            <SwapSide
              label="You receive"
              asset={to}
              amount={toAmount.toFixed(4)}
              readOnly
              onAssetClick={() => cycle(to, setTo, from)}
            />

            <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-900/5 px-4 py-3 text-xs text-slate-600">
              <span>Route</span>
              <span className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-slate-700" />
                Best · 0.21% slippage · ~3s
              </span>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={phase === "done" ? onClose : execute}
              disabled={phase === "loading"}
              className="liquid-metal mt-5 grid h-14 w-full place-items-center rounded-2xl text-base font-semibold text-white disabled:opacity-70"
            >
              {phase === "idle" && (
                <span>Swap {from.symbol} → {to.symbol}</span>
              )}
              {phase === "loading" && (
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  Routing through {route}…
                </motion.span>
              )}
              {phase === "done" && <span>Done · Tap to close</span>}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function cycle(
  current: AssetGroup,
  setter: (a: AssetGroup) => void,
  exclude: AssetGroup,
) {
  selection();
  const idx = ASSETS.findIndex((a) => a.symbol === current.symbol);
  for (let i = 1; i <= ASSETS.length; i++) {
    const next = ASSETS[(idx + i) % ASSETS.length];
    if (next.symbol !== exclude.symbol) {
      setter(next);
      return;
    }
  }
}

interface SideProps {
  label: string;
  asset: AssetGroup;
  amount: string;
  onAmountChange?: (v: string) => void;
  onAssetClick?: () => void;
  readOnly?: boolean;
}
function SwapSide({
  label,
  asset,
  amount,
  onAmountChange,
  onAssetClick,
  readOnly,
}: SideProps) {
  const total = assetTotal(asset);
  return (
    <div className="glass rounded-3xl p-4">
      <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span className="tabular-nums">
          Bal {total.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} {asset.symbol}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onAssetClick}
          className="flex items-center gap-2 rounded-2xl bg-slate-900/8 px-2 py-1.5 active:scale-95 transition"
        >
          <AssetIcon symbol={asset.symbol} color={asset.iconColor} size={32} />
          <span className="font-semibold">{asset.symbol}</span>
        </button>
        <input
          inputMode="decimal"
          value={amount}
          readOnly={readOnly}
          onChange={(e) => onAmountChange?.(e.target.value.replace(/[^0-9.]/g, ""))}
          className="min-w-0 flex-1 bg-transparent text-right text-2xl font-semibold tabular-nums tracking-tight outline-none"
        />
      </div>
    </div>
  );
}
