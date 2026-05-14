# Liquid Wallet — iOS 26 TMA

A high-fidelity UI prototype of a multi-chain Telegram Mini App crypto wallet
inspired by Apple iOS 26 / Vision Pro spatial design language.

> **Status:** Pure frontend prototype. All balances and the swap flow are mocked.
> No real wallet is connected. The Telegram WebApp script is loaded so
> `HapticFeedback.impactOccurred("medium")` and `selectionChanged()` fire
> automatically when the app runs inside Telegram.

## Highlights

- **Animated mesh-gradient atmosphere** with a subtle parallax shift.
- **Floating balance** that scales/translates smoothly on scroll.
- **Glass / Bento layout** (`backdrop-filter: blur(40px) saturate(150%)`) with
  inner shine and brand-tinted glow per asset (TON / ETH / SOL / USDT / USDC / BTC).
- **Liquid-metal Send button** — animated gradient with mercury-like sheen.
- **One-Tap Swap sheet** with route stub, slippage, loading shimmer and
  `canvas-confetti` celebration on success.
- **Multi-chain rows**: USDT and ETH/USDC group their per-chain balances and
  expand on tap (TON / Ethereum / Tron / Base) with chain badges.
- **Glass floating tab bar** with `layoutId` shared-pill animation.
- **Skeleton shimmer** loading state instead of generic spinners.
- **Telegram Haptics** wired into every actionable element.

## Stack

- Next.js 16 (App Router, static export — `output: "export"`)
- React 19 + TypeScript
- Tailwind CSS v4
- Framer Motion 12 (Spring animations, layout transitions, AnimatePresence)
- lucide-react icons
- canvas-confetti

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # static export to ./out
```

## Project layout

```
src/
  app/
    layout.tsx          # html shell, Telegram WebApp script, mesh background
    page.tsx            # mounts <Dashboard />
    globals.css         # design tokens, glass primitives, liquid-metal, mesh
  components/
    Dashboard.tsx       # top-level shell (header, tabs, scroll, modal)
    FloatingBalance.tsx # tabular-nums balance with scroll-driven scale/translate
    ActionButtons.tsx   # Send (liquid-metal) / Receive / Swap / Buy
    AssetIcon.tsx       # glassy coin icon with chain badge
    AssetRow.tsx        # bento row, expands per-chain holdings
    SwapModal.tsx       # bottom-sheet swap flow with confetti
    TabBar.tsx          # floating glass tab bar
    SkeletonCard.tsx    # shimmer loading row
  lib/
    haptics.ts          # Telegram WebApp haptic helpers (no-op outside TMA)
    mockData.ts         # tokens × per-chain holdings, vibe check
```

## Roadmap (not implemented)

- TON Connect 2.0 + WalletConnect for real signing.
- Li.Fi / Socket multi-chain swap routing.
- Toncenter / Moralis balance fetching.
- ERC-4337 smart account onboarding via Telegram Passkeys.
- Telegram Stars-priced wallet skins.
