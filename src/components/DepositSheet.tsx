"use client";

import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Check, Copy, Clock, X } from "lucide-react";
import { useState } from "react";
import { impact, notify } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";

interface Props {
  open: boolean;
  onClose: () => void;
  userId: string;
  onDeposited: () => void;
}

type Phase = "amount" | "invoice" | "confirming" | "done";

interface Invoice {
  id: string;
  amount: number;
  paymentAddress: string;
  paymentRef: string;
  expiresAt: number;
}

const QUICK_AMOUNTS = [10, 25, 50, 100, 250, 500];

export function DepositSheet({ open, onClose, userId, onDeposited }: Props) {
  const [amount, setAmount] = useState("50");
  const [phase, setPhase] = useState<Phase>("amount");
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [copied, setCopied] = useState<"address" | "ref" | null>(null);
  const [error, setError] = useState("");

  async function createInvoice() {
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      setError("Enter a valid amount");
      return;
    }
    if (num > 100000) {
      setError("Max 100,000 USDT per deposit");
      return;
    }
    setError("");
    impact("medium");

    try {
      const res = await fetch("/api/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount: num }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create invoice");
        return;
      }
      setInvoice(data);
      setPhase("invoice");
      sounds.open();
    } catch {
      setError("Network error");
    }
  }

  async function confirmPayment() {
    if (!invoice) return;
    impact("heavy");
    setPhase("confirming");

    try {
      const res = await fetch("/api/deposit/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: invoice.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Payment failed");
        setPhase("invoice");
        return;
      }
      setPhase("done");
      notify("success");
      sounds.success();
      onDeposited();
      confetti({
        particleCount: 120,
        spread: 70,
        startVelocity: 40,
        origin: { y: 0.6 },
        colors: ["#26A17B", "#5cb0ff", "#ffffff", "#007aff"],
      });
    } catch {
      setError("Network error");
      setPhase("invoice");
    }
  }

  function copyToClipboard(text: string, field: "address" | "ref") {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(field);
    sounds.tap();
    setTimeout(() => setCopied(null), 2000);
  }

  function handleClose() {
    sounds.close();
    setPhase("amount");
    setInvoice(null);
    setError("");
    setAmount("50");
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="deposit-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/30 backdrop-blur-md"
          onClick={handleClose}
        >
          <motion.div
            key="deposit-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(238,243,251,0.95) 100%)",
              backdropFilter: "blur(40px) saturate(180%)",
              WebkitBackdropFilter: "blur(40px) saturate(180%)",
            }}
            className="relative w-full max-w-md rounded-t-[36px] px-5 pt-3 pb-8 border-t border-x border-white/95 shadow-[0_-30px_80px_-20px_rgba(20,50,110,0.25)] text-slate-900"
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-300" />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">
                {phase === "amount" && "Deposit USDT"}
                {phase === "invoice" && "Payment Details"}
                {phase === "confirming" && "Processing..."}
                {phase === "done" && "Deposit Complete"}
              </h2>
              <button
                onClick={handleClose}
                className="grid h-9 w-9 place-items-center rounded-full glass"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {phase === "amount" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="mb-4">
                  <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-slate-500">
                    Amount (USDT)
                  </label>
                  <div className="glass rounded-2xl p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-semibold text-slate-400">
                        $
                      </span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        min="0.01"
                        max="100000"
                        step="0.01"
                        className="flex-1 bg-transparent text-3xl font-semibold tabular-nums outline-none placeholder:text-slate-300"
                      />
                      <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5">
                        <span
                          className="grid h-5 w-5 place-items-center rounded-full text-[8px] font-bold text-white"
                          style={{ background: "#26A17B" }}
                        >
                          ₮
                        </span>
                        <span className="text-xs font-semibold text-emerald-700">
                          USDT
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-5 flex flex-wrap gap-2">
                  {QUICK_AMOUNTS.map((qa) => (
                    <button
                      key={qa}
                      onClick={() => {
                        setAmount(String(qa));
                        sounds.tap();
                      }}
                      className={`rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                        amount === String(qa)
                          ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
                          : "glass text-slate-700"
                      }`}
                    >
                      ${qa}
                    </button>
                  ))}
                </div>

                {error && (
                  <p className="mb-3 text-center text-sm text-rose-500">
                    {error}
                  </p>
                )}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={createInvoice}
                  className="liquid-metal grid h-14 w-full place-items-center rounded-2xl text-base font-semibold text-white"
                >
                  Create Payment
                </motion.button>

                <p className="mt-3 text-center text-[11px] text-slate-400">
                  Powered by LiquidPay
                </p>
              </motion.div>
            )}

            {phase === "invoice" && invoice && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-center">
                  <div className="glass-strong rounded-[28px] px-6 py-4 text-center">
                    <div className="text-xs font-medium uppercase tracking-widest text-slate-500">
                      Send exactly
                    </div>
                    <div className="mt-1 text-3xl font-bold tabular-nums text-slate-900">
                      {invoice.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      <span className="text-lg text-emerald-600">USDT</span>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-2xl p-4 space-y-3">
                  <div>
                    <div className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                      Payment Address
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="flex-1 truncate text-sm font-mono text-slate-700">
                        {invoice.paymentAddress}
                      </code>
                      <button
                        onClick={() =>
                          copyToClipboard(invoice.paymentAddress, "address")
                        }
                        className="grid h-8 w-8 place-items-center rounded-full glass active:scale-90 transition"
                      >
                        {copied === "address" ? (
                          <Check size={14} className="text-emerald-500" />
                        ) : (
                          <Copy size={14} className="text-slate-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-slate-200/60" />

                  <div>
                    <div className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                      Reference Code
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="flex-1 text-sm font-mono text-slate-700">
                        {invoice.paymentRef}
                      </code>
                      <button
                        onClick={() =>
                          copyToClipboard(invoice.paymentRef, "ref")
                        }
                        className="grid h-8 w-8 place-items-center rounded-full glass active:scale-90 transition"
                      >
                        {copied === "ref" ? (
                          <Check size={14} className="text-emerald-500" />
                        ) : (
                          <Copy size={14} className="text-slate-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-slate-200/60" />

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock size={13} />
                    <span>
                      Expires in 30 minutes &middot; Invoice{" "}
                      {invoice.id}
                    </span>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={confirmPayment}
                  className="liquid-metal grid h-14 w-full place-items-center rounded-2xl text-base font-semibold text-white"
                >
                  I&apos;ve Sent the Payment
                </motion.button>

                <p className="text-center text-[11px] text-slate-400">
                  After sending USDT to the address above, tap &ldquo;I&apos;ve
                  Sent&rdquo; to confirm
                </p>
              </motion.div>
            )}

            {phase === "confirming" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4 py-8"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="grid h-16 w-16 place-items-center rounded-full glass-strong"
                >
                  <div className="h-8 w-8 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-500" />
                </motion.div>
                <p className="text-sm text-slate-500">
                  Verifying payment...
                </p>
              </motion.div>
            )}

            {phase === "done" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.1,
                  }}
                  className="grid h-20 w-20 place-items-center rounded-full"
                  style={{ background: "linear-gradient(135deg, #26A17B 0%, #1a8a6a 100%)" }}
                >
                  <Check size={36} className="text-white" strokeWidth={3} />
                </motion.div>
                <div className="text-center">
                  <p className="text-xl font-semibold">
                    +{invoice?.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} USDT
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Successfully deposited to your account
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleClose}
                  className="mt-2 rounded-2xl px-8 py-3 text-sm font-semibold glass text-slate-700"
                >
                  Done
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
