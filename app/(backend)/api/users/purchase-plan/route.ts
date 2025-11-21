import { NextResponse } from "next/server";
import { connectDB } from "@/app/(backend)/lib/db";
import { User } from "@/app/(backend)/models/user.model";
import { Plan } from "@/app/(backend)/models/plan.model";
import { UserPlan } from "@/app/(backend)/models/planPurchase.model";
import { Transaction } from "@/app/(backend)/models/transaction.model";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { token, planId } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Decode JWT
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    const userId = decoded.userId;

    const user = await User.findOne({ userId });
    console.log("user", user)
    if (!user) return NextResponse.json({ success: false, message: "User not found" });

    const plan = await Plan.findById(planId);
    if (!plan) return NextResponse.json({ success: false, message: "Plan not found" });

    // Check balance in Topup Wallet
    if (user.topupWalletBalance < plan.amount) {
      return NextResponse.json({
        success: false,
        message: "Insufficient balance in Topup Wallet",
      });
    }

    // Deduct amount
    console.log(user.topupWalletBalance,' balance', plan.amount)
    user.topupWalletBalance -= plan.amount;
    await user.save();

    // Create purchase
    const purchase = await UserPlan.create({
      userId: user.userId,
      planId: plan._id,
      amount: plan.amount,
      dailyCommission: plan.dailyCommission,
      monthlyCommission: plan.monthlyCommission,
      levels: plan.levels,
      startDate: new Date(),
      // endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      status: 1, // auto approved
    });

    // Create transaction
    await Transaction.create({
      userId: user.userId,
      type: 2, // debit
      subAmount: plan.amount,
      amount: plan.amount,
      source: 4, // deposit purchase
      status: 1,
      walletType: 2, // topup wallet
      planId:plan._id,
      description: `Plan Purchased (${plan.name})`,
      paymentDate: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Plan purchased successfully",
      purchase,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
