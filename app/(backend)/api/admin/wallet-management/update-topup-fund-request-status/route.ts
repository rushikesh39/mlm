import { NextResponse } from "next/server";
import { User } from "@/app/(backend)/models/user.model";
import { Transaction } from "@/app/(backend)/models/transaction.model";
import { connectDB } from "@/app/(backend)/lib/db";

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { requestId, status, adminNote } = await req.json();

    const reqData = await Transaction.findById(requestId);
    if (!reqData) {
      return NextResponse.json({
        success: false,
        message: "Request not found",
      });
    }

    reqData.status = status;
    reqData.note = adminNote;
    await reqData.save();

    // If approved: credit wallet
    if (status === 1) {
      await Transaction.create({
        userId: reqData.userId,
        type: 1, // credit
        walletType: 2, // topup wallet
        amount: reqData.amount,
        source: 1, // fund request
        description: "Fund Request Approved",
        status: 1,
        paymentDate: new Date(),
      });

      await User.findOneAndUpdate(
        { userId: reqData.userId },
        { $inc: { topupWalletBalance: reqData.amount } },
        { new: true }
      );
    }

    return NextResponse.json({
      success: true,
      message: status === 1 ? "Request Approved" : "Request Rejected",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
