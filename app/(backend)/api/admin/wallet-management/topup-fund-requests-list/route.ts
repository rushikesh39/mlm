import { NextResponse } from "next/server";
import { connectDB } from "@/app/(backend)/lib/db";
import { Transaction } from "@/app/(backend)/models/transaction.model";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  let query: any = {};
  if (status !== "all" && status !== null) {
    query.status = Number(status);
  }

  const list = await Transaction.find(query).sort({ createdAt: -1 });

  return NextResponse.json({ success: true, list });
}
