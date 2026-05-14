"use client";

import { CHAINS, type ChainId } from "@/lib/mockData";

interface Props {
  symbol: string;
  color: string;
  chain?: ChainId;
  size?: number;
}

/** Glass-coin icon with a chain badge in the corner. */
export function AssetIcon({ symbol, color, chain, size = 44 }: Props) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(120% 120% at 30% 25%, ${color}aa 0%, ${color}55 55%, ${color}11 100%)`,
          boxShadow: `inset 0 1px 1px rgba(255,255,255,0.4), 0 8px 22px -6px ${color}66`,
        }}
      />
      <div
        className="absolute inset-0 flex items-center justify-center font-semibold tracking-tight text-white"
        style={{ fontSize: size * 0.36 }}
      >
        {symbol.slice(0, 3)}
      </div>
      {chain && (
        <div
          className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full glass"
          style={{
            width: size * 0.42,
            height: size * 0.42,
            fontSize: size * 0.18,
            color: CHAINS[chain].color,
          }}
          aria-label={CHAINS[chain].name}
        >
          {CHAINS[chain].short.slice(0, 3)}
        </div>
      )}
    </div>
  );
}
