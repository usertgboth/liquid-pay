"use client";

import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useRef, useState } from "react";
import { impact, selection } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { CHAINS, type AssetGroup, assetTotal } from "@/lib/mockData";
import { AssetIcon } from "./AssetIcon";
import { ChainBadgeStack } from "./ChainBadgeStack";

const fmtUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
const fmtAmt = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 4,
});

interface Props {
  asset: AssetGroup;
  /** Index in the visible list so deformation can stagger naturally. */
  index: number;
  /** Container scroll position; drives liquid overlap effect. */
  scrollY: MotionValue<number>;
}

export function AssetRow({ asset, index, scrollY }: Props) {
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const total = assetTotal(asset);
  const expandable = asset.holdings.length > 1;
  const positive = asset.change24h >= 0;

  // Liquid drop-overlap: as the user scrolls past each row's anchor,
  // the row compresses vertically + overlaps the next one slightly.
  // We use the index to stagger anchors so each row morphs in turn.
  const anchor = 60 + index * 30;
  const squeeze = useTransform(scrollY, [anchor - 60, anchor + 60], [0, 1]);
  const compress = useTransform(squeeze, [0, 1], [1, 0.985]);
  const overlap = useTransform(squeeze, [0, 1], [0, -8]);
  const radius = useTransform(squeeze, [0, 1], [24, 36]);
  const radiusCss = useMotionTemplate`${radius}px`;

  return (
    <motion.li
      ref={ref}
      layout
      style={{
        scaleY: compress,
        marginTop: index === 0 ? 0 : overlap,
        borderRadius: radiusCss,
      }}
      className={`glass relative overflow-hidden glow-${asset.glow}`}
    >
      <button
        type="button"
        onClick={() => {
          if (!expandable) {
            // Negative-control row still gets a soft tap.
            impact("light");
            sounds.tap();
            return;
          }
          selection();
          sounds.select();
          setSpinning(true);
          setOpen((o) => !o);
          window.setTimeout(() => setSpinning(false), 950);
        }}
        className="flex w-full items-center gap-3 px-3.5 py-3 text-left active:bg-slate-900/5"
      >
        <AssetIcon symbol={asset.symbol} color={asset.iconColor} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-tight">{asset.symbol}</span>
            {expandable && (
              <ChainBadgeStack
                chains={asset.holdings.map((h) => h.chain)}
                spinning={spinning}
              />
            )}
          </div>
          <div className="text-xs text-slate-500 tabular-nums">
            {fmtUsd.format(asset.price)} ·{" "}
            <span className={positive ? "text-emerald-600" : "text-rose-600"}>
              {positive ? "+" : ""}
              {asset.change24h.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold tabular-nums">
            {fmtUsd.format(total.usd)}
          </div>
          <div className="text-xs text-slate-500 tabular-nums">
            {fmtAmt.format(total.amount)} {asset.symbol}
          </div>
        </div>
        {expandable && (
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            className="ml-1 grid h-7 w-7 place-items-center rounded-full bg-slate-900/5"
          >
            <ChevronDown size={14} />
          </motion.div>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && expandable && (
          <motion.ul
            key="chains"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            className="overflow-hidden border-t border-slate-900/10"
          >
            {asset.holdings.map((h) => {
              const chain = CHAINS[h.chain];
              return (
                <li
                  key={h.chain}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm"
                >
                  <span
                    className="grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold"
                    style={{
                      background: `${chain.color}33`,
                      color: chain.color,
                      boxShadow: `inset 0 0 0 1px ${chain.color}55`,
                    }}
                  >
                    {chain.short}
                  </span>
                  <span className="flex-1 text-slate-700">{chain.name}</span>
                  <span className="tabular-nums text-slate-900">
                    {fmtAmt.format(h.amount)} {asset.symbol}
                  </span>
                  <span className="ml-3 tabular-nums text-slate-500">
                    {fmtUsd.format(h.usd)}
                  </span>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.li>
  );
}
