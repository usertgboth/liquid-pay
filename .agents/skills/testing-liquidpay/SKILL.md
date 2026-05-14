---
name: testing-liquidpay
description: Test the LiquidPay deposit flow end-to-end. Use when verifying deposit UI, balance updates, or transaction history changes.
---

# Testing LiquidPay

## Prerequisites
- Node.js installed
- Run `npm install` then `npm run dev` to start dev server on localhost:3000
- Storage is in-memory — server restart resets all balances

## Key Test Flow: Deposit E2E

1. Open http://localhost:3000
2. Verify initial state: balance shows `0.00` with `USDT` label, `Deposit` button is first action
3. Click **Deposit** → sheet opens with "Deposit USDT" title, amount defaults to 50
4. Use quick-amount buttons ($10, $25, $50, $100, $250, $500) or type custom amount
5. Click **Create Payment** → invoice phase shows:
   - "Send exactly X.XX USDT"
   - Payment address starting with `LP` (34 chars)
   - Reference code starting with `REF-`
   - Invoice ID starting with `INV-`
   - "Expires in 30 minutes" notice
6. Click **I've Sent the Payment** → spinner shows "Verifying payment..."
7. Success screen: green checkmark, "+X.XX USDT", confetti animation
8. Click **Done** → balance updates, transaction appears in "Recent Transactions"

## Assertions to Check
- Balance accumulates correctly across multiple deposits
- Each deposit creates a unique invoice ID, payment address, and reference code
- Transaction history shows entries in reverse chronological order
- Transaction entries show: type (deposit), time (Just now), ref code, amount, status (completed)

## Multi-User Testing
- Each browser/tab gets a unique userId stored in localStorage key `lp.userId`
- To test multi-user: open incognito window → different userId → independent balance
- Server stores balances per userId in memory

## API Endpoints
- `POST /api/user` — initialize user (body: `{userId}`)
- `GET /api/balance?userId=X` — get balance
- `POST /api/deposit` — create invoice (body: `{userId, amount}`)
- `POST /api/deposit/confirm` — confirm payment (body: `{invoiceId}`)
- `GET /api/transactions?userId=X` — get transaction history

## Known Limitations
- In-memory storage resets on server restart
- Invoice expiry (30 min) is tracked but not enforced in UI countdown
- Send, Receive, Swap buttons are UI-only placeholders
