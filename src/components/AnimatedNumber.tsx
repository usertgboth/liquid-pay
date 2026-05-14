"use client";

import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type MotionValue,
} from "framer-motion";
import { useEffect } from "react";

interface Props {
  value: number;
  /** Number of fraction digits, default 2 (USD cents). */
  fractionDigits?: number;
  /** Prefix like "$". */
  prefix?: string;
  className?: string;
  /** Spring stiffness for the digit roll (default soft). */
  duration?: number;
}

/**
 * Smoothly animates a numeric value with `tabular-nums`.
 * Uses Framer Motion's `animate` to spring the value, and a derived
 * Intl.NumberFormat string for display.
 */
export function AnimatedNumber({
  value,
  fractionDigits = 2,
  prefix,
  className,
  duration = 1.6,
}: Props) {
  const mv: MotionValue<number> = useMotionValue(value);
  const text = useTransform(mv, (v) =>
    v.toLocaleString("en-US", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }),
  );

  useEffect(() => {
    const controls = animate(mv, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [value, mv, duration]);

  return (
    <span
      className={className}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {prefix}
      <motion.span>{text}</motion.span>
    </span>
  );
}
