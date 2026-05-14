import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/store";

export async function POST(req: Request) {
  const body = await req.json();
  const userId = body.userId as string;
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }
  const user = getOrCreateUser(userId);
  return NextResponse.json({
    id: user.id,
    balance: user.balance,
    createdAt: user.createdAt,
  });
}
