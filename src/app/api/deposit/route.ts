import { NextResponse } from "next/server";
import { createInvoice } from "@/lib/store";

export async function POST(req: Request) {
  const body = await req.json();
  const { userId, amount } = body;

  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }
  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0 || numAmount > 100000) {
    return NextResponse.json(
      { error: "Amount must be between 0.01 and 100,000 USDT" },
      { status: 400 },
    );
  }

  const invoice = createInvoice(userId, numAmount);
  return NextResponse.json(invoice);
}
