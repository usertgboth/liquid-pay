"use client";

import { motion } from "framer-motion";
import { ArrowDownLeft, Clock } from "lucide-react";
import type { Transaction } from "@/lib/store";

interface Props {
  transactions: Transaction[];
}

const fmtUsd = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function TransactionHistory({ transactions }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center text-center">
        <div className="glass-strong grid h-16 w-16 place-items-center rounded-[22px]">
          <Clock size={28} className="text-slate-400" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-500">
          No transactions yet
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Deposit USDT to get started
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="mb-3 px-1 text-sm font-semibold tracking-tight text-slate-700">
        Recent Transactions
      </h3>
      <ul className="space-y-2">
        {transactions.map((tx, i) => (
          <motion.li
            key={tx.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass flex items-center gap-3 rounded-[20px] px-3.5 py-3"
          >
            <div
              className="grid h-10 w-10 place-items-center rounded-full"
              style={{
                background:
                  tx.type === "deposit"
                    ? "linear-gradient(135deg, #26A17B22 0%, #26A17B44 100%)"
                    : "linear-gradient(135deg, #007aff22 0%, #007aff44 100%)",
              }}
            >
              <ArrowDownLeft
                size={18}
                className={
                  tx.type === "deposit"
                    ? "text-emerald-600"
                    : "text-blue-500"
                }
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm capitalize">{tx.type}</div>
              <div className="text-xs text-slate-500">
                {formatTime(tx.completedAt ?? tx.createdAt)}
                {tx.paymentRef && (
                  <span className="ml-1.5 text-slate-400">
                    &middot; {tx.paymentRef}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div
                className={`font-semibold tabular-nums text-sm ${
                  tx.type === "deposit"
                    ? "text-emerald-600"
                    : "text-slate-900"
                }`}
              >
                {tx.type === "deposit" ? "+" : "-"}
                {fmtUsd.format(tx.amount)} USDT
              </div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">
                {tx.status}
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
