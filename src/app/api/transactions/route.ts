import { NextRequest, NextResponse } from "next/server";
import { getUserTransactions } from "@/lib/store";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const transactions = getUserTransactions(userId);
  return NextResponse.json({ transactions });
}
