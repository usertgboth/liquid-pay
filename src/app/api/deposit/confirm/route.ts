import { NextResponse } from "next/server";
import { confirmInvoice } from "@/lib/store";

export async function POST(req: Request) {
  const body = await req.json();
  const invoiceId = body.invoiceId as string;

  if (!invoiceId) {
    return NextResponse.json(
      { error: "invoiceId required" },
      { status: 400 },
    );
  }

  const result = confirmInvoice(invoiceId);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    invoice: result.invoice,
  });
}
