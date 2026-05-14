export type ChainId = "ton" | "ethereum" | "solana" | "base" | "tron";

export interface ChainMeta {
  id: ChainId;
  name: string;
  short: string;
  color: string;
}

export const CHAINS: Record<ChainId, ChainMeta> = {
  ton: { id: "ton", name: "TON", short: "TON", color: "#0098EA" },
  ethereum: {
    id: "ethereum",
    name: "Ethereum",
    short: "ETH",
    color: "#7882FF",
  },
  solana: { id: "solana", name: "Solana", short: "SOL", color: "#9945FF" },
  base: { id: "base", name: "Base", short: "BASE", color: "#2151F5" },
  tron: { id: "tron", name: "Tron", short: "TRX", color: "#EB0029" },
};

export interface ChainHolding {
  chain: ChainId;
  amount: number;
  usd: number;
}

export interface AssetGroup {
  symbol: string;
  name: string;
  iconColor: string;
  glow: "ton" | "eth" | "sol" | "usdt" | "usdc" | "btc";
  price: number;
  change24h: number;
  holdings: ChainHolding[];
}

/** Build a simple asset list grouped by symbol with per-chain holdings. */
export const ASSETS: AssetGroup[] = [
  {
    symbol: "USDT",
    name: "Tether",
    iconColor: "#26A17B",
    glow: "usdt",
    price: 1.0,
    change24h: 0.01,
    holdings: [
      { chain: "ton", amount: 4280.5, usd: 4280.5 },
      { chain: "ethereum", amount: 2110.0, usd: 2110.0 },
      { chain: "tron", amount: 1830.25, usd: 1830.25 },
    ],
  },
  {
    symbol: "TON",
    name: "Toncoin",
    iconColor: "#0098EA",
    glow: "ton",
    price: 5.42,
    change24h: 4.18,
    holdings: [{ chain: "ton", amount: 1280.4, usd: 6939.77 }],
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    iconColor: "#7882FF",
    glow: "eth",
    price: 3120.55,
    change24h: -1.32,
    holdings: [
      { chain: "ethereum", amount: 1.234, usd: 3850.76 },
      { chain: "base", amount: 0.412, usd: 1285.67 },
    ],
  },
  {
    symbol: "SOL",
    name: "Solana",
    iconColor: "#9945FF",
    glow: "sol",
    price: 168.2,
    change24h: 7.41,
    holdings: [{ chain: "solana", amount: 18.42, usd: 3098.44 }],
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    iconColor: "#2775CA",
    glow: "usdc",
    price: 1.0,
    change24h: 0.0,
    holdings: [
      { chain: "ethereum", amount: 980.0, usd: 980.0 },
      { chain: "base", amount: 510.5, usd: 510.5 },
    ],
  },
  {
    symbol: "BTC",
    name: "Bitcoin (Wrapped)",
    iconColor: "#F7931A",
    glow: "btc",
    price: 67200,
    change24h: 1.95,
    holdings: [{ chain: "ethereum", amount: 0.042, usd: 2822.4 }],
  },
];

export function totalUsd(): number {
  return ASSETS.reduce(
    (sum, a) => sum + a.holdings.reduce((s, h) => s + h.usd, 0),
    0,
  );
}

export function assetTotal(a: AssetGroup): { amount: number; usd: number } {
  return a.holdings.reduce(
    (acc, h) => ({ amount: acc.amount + h.amount, usd: acc.usd + h.usd }),
    { amount: 0, usd: 0 },
  );
}

export function vibeCheck(total: number, change: number): string {
  if (change > 5) return "Diamond Hands 💎";
  if (change > 1) return "Steady Climber";
  if (change < -3) return "Paper Hand Clown 🤡";
  if (change < 0) return "HODL & Pray";
  if (total > 20_000) return "Whale Mode";
  return "Vibe Check: Chill";
}
