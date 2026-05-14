import { NextRequest, NextResponse } from "next/server";
import { getUserBalance, getOrCreateUser } from "@/lib/store";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }
  getOrCreateUser(userId);
  const balance = getUserBalance(userId);
  return NextResponse.json({ userId, balance });
}
