import { NextResponse } from "next/server";
import { connectDB } from "@/app/(backend)/lib/db";
import { Transaction } from "@/app/(backend)/models/transaction.model";
import { User } from "@/app/(backend)/models/user.model";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { userId, amount, type, walletType, note } = await req.json();

    if (!userId || !amount || amount <= 0 || !type || !walletType) {
      return NextResponse.json({
        success: false,
        message: "Invalid input",
      });
    }

    await Transaction.create({
      userId,
      type,
      walletType,
      amount,
      source: 8,
      description: note || "Admin adjustment",
      status: 1,
      paymentDate: new Date(),
    });

    await User.findOneAndUpdate(
      { userId },
      walletType == 1
        ? type == 1
          ? { $inc: { eWalletBalance: amount } } // Add to eWallet
          : { $inc: { eWalletBalance: -amount } } // Subtract from eWallet
        : type == 1
        ? { $inc: { topupWalletBalance: amount } } // Add to TopupWallet
        : { $inc: { topupWalletBalance: -amount } }, // Subtract from TopupWallet
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Success",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
