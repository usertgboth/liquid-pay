"use client";

import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Search, Send, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { impact, notify, selection } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";

interface Contact {
  id: string;
  name: string;
  handle: string;
  emoji: string;
  hue: number; // 0..360 for avatar gradient
}

const CONTACTS: Contact[] = [
  { id: "1", name: "Anya", handle: "@anya_eth", emoji: "💎", hue: 220 },
  { id: "2", name: "Bobby", handle: "@bobsol", emoji: "👻", hue: 270 },
  { id: "3", name: "Mira", handle: "@miramira", emoji: "🌸", hue: 320 },
  { id: "4", name: "Kostya", handle: "@kostas", emoji: "🛸", hue: 200 },
  { id: "5", name: "Lev", handle: "@levvy", emoji: "🐉", hue: 150 },
  { id: "6", name: "Dasha", handle: "@dashaton", emoji: "✨", hue: 250 },
  { id: "7", name: "Eli", handle: "@elizm", emoji: "🪐", hue: 290 },
  { id: "8", name: "Zaur", handle: "@zaur", emoji: "🔥", hue: 20 },
  { id: "9", name: "Nika", handle: "@nikan", emoji: "🌊", hue: 190 },
  { id: "10", name: "Roma", handle: "@roma", emoji: "⚡", hue: 60 },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

type Phase = "pick" | "amount" | "flying" | "done";

export function VibeSendSheet({ open, onClose }: Props) {
  // The parent remounts this component each time `sendOpen` flips, so
  // initial state is correct without an effect.
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Contact | null>(null);
  const [amount, setAmount] = useState("25");
  const [phase, setPhase] = useState<Phase>("pick");
  const sheetRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CONTACTS;
    return CONTACTS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.handle.toLowerCase().includes(q),
    );
  }, [query]);

  function pick(c: Contact) {
    selection();
    sounds.select();
    setPicked(c);
    setPhase("amount");
  }

  async function fly() {
    if (!picked || !sheetRef.current) return;
    impact("heavy");
    sounds.swap();
    setPhase("flying");

    // Particle burst at the bottom-center (where amount keypad sits)
    confetti({
      particleCount: 60,
      spread: 60,
      startVelocity: 38,
      gravity: 0.7,
      ticks: 110,
      origin: { y: 0.78 },
      colors: ["#007aff", "#5cb0ff", "#a7c8ff", "#ffffff"],
    });

    // After the visual flight, lock in success.
    await new Promise((r) => setTimeout(r, 900));
    notify("success");
    sounds.success();
    setPhase("done");

    // Final shower at top to "land" on the avatar.
    confetti({
      particleCount: 100,
      spread: 80,
      startVelocity: 30,
      gravity: 0.4,
      origin: { y: 0.32 },
      colors: ["#ffffff", "#5cb0ff", "#007aff"],
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
          onClick={() => {
            sounds.close();
            onClose();
          }}
        >
          <motion.div
            ref={sheetRef}
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
            className="relative w-full max-w-md rounded-t-[36px] px-5 pt-3 pb-7 border-t border-x border-white/95 shadow-[0_-30px_80px_-20px_rgba(20,50,110,0.25)] text-slate-900"
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-300" />
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">
                {phase === "pick" && "Send to"}
                {phase === "amount" && picked && `Send to ${picked.name}`}
                {phase === "flying" && "Sending…"}
                {phase === "done" && "Delivered"}
              </h2>
              <button
                onClick={() => {
                  sounds.close();
                  onClose();
                }}
                className="grid h-9 w-9 place-items-center rounded-full glass"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {phase === "pick" && (
              <ContactPicker
                contacts={filtered}
                query={query}
                onQuery={setQuery}
                onPick={pick}
              />
            )}

            {phase === "amount" && picked && (
              <AmountStep
                contact={picked}
                amount={amount}
                onAmount={setAmount}
                onSend={fly}
                onBack={() => setPhase("pick")}
              />
            )}

            {(phase === "flying" || phase === "done") && picked && (
              <FlightStage contact={picked} amount={amount} done={phase === "done"} onClose={onClose} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Avatar({ contact, size = 56 }: { contact: Contact; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: `conic-gradient(from 0deg, hsl(${contact.hue} 70% 65%), hsl(${
          (contact.hue + 60) % 360
        } 70% 55%), hsl(${contact.hue} 70% 65%))`,
        boxShadow: `0 8px 24px -8px hsl(${contact.hue} 70% 50% / 0.55), inset 0 0 0 2px rgba(255,255,255,0.4)`,
      }}
      className="grid place-items-center rounded-full text-2xl"
    >
      <span aria-hidden>{contact.emoji}</span>
    </div>
  );
}

function ContactPicker({
  contacts,
  query,
  onQuery,
  onPick,
}: {
  contacts: Contact[];
  query: string;
  onQuery: (q: string) => void;
  onPick: (c: Contact) => void;
}) {
  return (
    <>
      <div className="glass mb-3 flex items-center gap-2 rounded-full px-3 py-2">
        <Search size={14} className="text-slate-500" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search Telegram contacts"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500"
        />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {contacts.map((c) => (
          <motion.button
            key={c.id}
            whileTap={{ scale: 0.92 }}
            onClick={() => onPick(c)}
            className="flex flex-col items-center gap-1.5"
          >
            <Avatar contact={c} size={56} />
            <span className="max-w-[64px] truncate text-[11px] font-medium text-slate-800">
              {c.name}
            </span>
            <span className="max-w-[64px] truncate text-[10px] text-slate-500">
              {c.handle}
            </span>
          </motion.button>
        ))}
      </div>
    </>
  );
}

function AmountStep({
  contact,
  amount,
  onAmount,
  onSend,
  onBack,
}: {
  contact: Contact;
  amount: string;
  onAmount: (a: string) => void;
  onSend: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <Avatar contact={contact} size={72} />
      <div className="mt-2 text-sm font-medium">{contact.name}</div>
      <div className="text-xs text-slate-500">{contact.handle}</div>

      <div className="glass mt-5 w-full rounded-3xl p-4">
        <div className="text-xs text-slate-500">Amount (USDT)</div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-semibold text-slate-500">$</span>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) =>
              onAmount(e.target.value.replace(/[^0-9.]/g, ""))
            }
            className="min-w-0 flex-1 bg-transparent text-4xl font-semibold tabular-nums tracking-tight outline-none"
          />
        </div>
        <div className="mt-3 flex gap-2">
          {["10", "25", "100", "MAX"].map((p) => (
            <button
              key={p}
              onClick={() => {
                selection();
                sounds.tap();
                onAmount(p === "MAX" ? "8220.75" : p);
              }}
              className="rounded-full bg-slate-900/8 px-3 py-1 text-xs font-medium text-slate-800 active:scale-95"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex w-full gap-2">
        <button
          onClick={() => {
            sounds.tap();
            onBack();
          }}
          className="glass flex-1 rounded-2xl px-4 py-3 text-sm font-medium"
        >
          Back
        </button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onSend}
          className="liquid-metal flex-[2] flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white"
        >
          <Send size={14} />
          Send to {contact.name}
        </motion.button>
      </div>
    </div>
  );
}

function FlightStage({
  contact,
  amount,
  done,
  onClose,
}: {
  contact: Contact;
  amount: string;
  done: boolean;
  onClose: () => void;
}) {
  return (
    <div className="relative h-[260px] w-full">
      {/* Avatar at top */}
      <div className="absolute left-1/2 top-2 -translate-x-1/2 flex flex-col items-center">
        <motion.div
          animate={done ? { scale: [1, 1.18, 1] } : { scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Avatar contact={contact} size={72} />
        </motion.div>
        <div className="mt-2 text-sm font-medium">{contact.name}</div>
        <div className="text-xs text-slate-500">{contact.handle}</div>
      </div>

      {/* Flying coin */}
      {!done && (
        <motion.div
          initial={{
            left: "50%",
            top: "82%",
            x: "-50%",
            y: "-50%",
            scale: 1.2,
            opacity: 1,
          }}
          animate={{
            left: "50%",
            top: ["82%", "32%"],
            scale: [1.2, 0.6],
            opacity: [1, 0.85],
          }}
          transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
          className="absolute z-10 grid h-12 w-12 place-items-center rounded-full text-base font-bold text-white"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.85), rgba(0,122,255,0.85) 60%, rgba(0,122,255,0.4))",
            boxShadow: "0 0 24px rgba(0,122,255,0.7)",
            transform: "translate(-50%, -50%)",
          }}
        >
          $
        </motion.div>
      )}

      {/* Trail line */}
      <svg
        viewBox="0 0 200 260"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <motion.line
          x1={100}
          y1={220}
          x2={100}
          y2={70}
          stroke="rgba(0, 122, 255, 0.4)"
          strokeWidth={2}
          strokeDasharray="2 6"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </svg>

      {/* Done state */}
      {done && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-0 w-full text-center"
        >
          <div className="text-sm text-slate-800">
            Sent <span className="font-semibold tabular-nums">${amount}</span>{" "}
            to {contact.name}
          </div>
          <button
            onClick={onClose}
            className="liquid-metal mt-3 inline-flex h-12 items-center justify-center rounded-2xl px-6 text-sm font-semibold text-white"
          >
            Done · Tap to close
          </button>
        </motion.div>
      )}
    </div>
  );
}
