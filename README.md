# LiquidPay — USDT Payment Platform TMA

A high-fidelity Telegram Mini App for managing USDT balance with a built-in
payment system (LiquidPay). Users can deposit USDT via unique payment invoices.

## Features

- **USDT Balance** — real-time balance display in USDT with animated numbers.
- **LiquidPay Deposits** — create payment invoices with unique addresses and
  reference codes. Confirm payments to top up your balance instantly.
- **Multi-user support** — each user gets a unique ID (Telegram user ID or
  auto-generated). Server-side balance storage ensures isolation between users.
- **Transaction History** — full deposit history with timestamps, amounts, and
  reference codes.
- **iOS 26 / Vision Pro UI** — glass morphism, liquid-metal buttons, starfield
  background, haptic feedback, UI sounds.
- **Telegram Integration** — `HapticFeedback` and Telegram user ID detection.

## Stack

- Next.js 16 (App Router, API Routes for server-side logic)
- React 19 + TypeScript
- Tailwind CSS v4
- Framer Motion 12 (Spring animations, layout transitions, AnimatePresence)
- lucide-react icons
- canvas-confetti

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm start            # production server
```

## API Routes

| Endpoint | Method | Description |
|---|---|---|
| `/api/user` | POST | Register or retrieve user account |
| `/api/balance` | GET | Get user USDT balance |
| `/api/deposit` | POST | Create a deposit invoice |
| `/api/deposit/confirm` | POST | Confirm payment for an invoice |
| `/api/transactions` | GET | Get user transaction history |

## Project layout

```
src/
  app/
    layout.tsx            # html shell, Telegram WebApp script, mesh background
    page.tsx              # mounts <Dashboard />
    globals.css           # design tokens, glass primitives, liquid-metal, mesh
    api/
      user/route.ts       # user registration / retrieval
      balance/route.ts    # get USDT balance
      deposit/route.ts    # create deposit invoice
      deposit/confirm/route.ts  # confirm payment
      transactions/route.ts     # transaction history
  components/
    Dashboard.tsx         # top-level shell (header, tabs, scroll, modals)
    FloatingBalance.tsx   # USDT balance with scroll-driven scale/translate
    ActionButtons.tsx     # Deposit (liquid-metal) / Send / Receive / Swap
    DepositSheet.tsx      # deposit flow: amount → invoice → confirm → done
    TransactionHistory.tsx # list of recent transactions
    AssetIcon.tsx         # glassy coin icon with chain badge
    SwapModal.tsx         # bottom-sheet swap flow with confetti
    VibeSendSheet.tsx     # send-to-contact flow
    TabBar.tsx            # floating glass tab bar
    SkeletonCard.tsx      # shimmer loading row
  lib/
    store.ts              # server-side in-memory store (users, invoices, txs)
    haptics.ts            # Telegram WebApp haptic helpers
    mockData.ts           # token data for swap UI
    sounds.ts             # programmatic UI sounds
```
