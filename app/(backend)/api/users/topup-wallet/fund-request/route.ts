import { NextResponse } from "next/server";
import { connectDB } from "@/app/(backend)/lib/db";
import { Transaction } from "@/app/(backend)/models/transaction.model";
import { User } from "@/app/(backend)/models/user.model";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token)
      return NextResponse.json({ success: false, message: "Unauthorized" });

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ success: false, message: "Invalid token" });
    }

    const { amount, txnNo, note, attachment } = body;
    const userId = decoded.userId;

    if (!amount || amount <= 0) {
      return NextResponse.json({
        success: false,
        message: "Invalid amount",
      });
    }

    await Transaction.create({
      userId,
      amount,
      txnNo,
      note,
      attachment,
    });

    return NextResponse.json({
      success: true,
      message: "Fund request submitted",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
