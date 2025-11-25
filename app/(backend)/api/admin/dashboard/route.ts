import { NextResponse } from "next/server";
import { connectDB } from "@/app/(backend)/lib/db";
import { User } from "@/app/(backend)/models/user.model";
import { Kyc } from "@/app/(backend)/models/kyc.model";
import { Transaction } from "@/app/(backend)/models/transaction.model";
import { PlanPurchase } from "@/app/(backend)/models/planPurchase.model";
import { requireAuth } from "@/app/(backend)/middleware/auth";
import { USER_ROLES } from "@/app/(backend)/config/roles";

export async function GET(req: Request) {
  try {
    // ✅ Auth check
    const { user, error } = requireAuth(req, [
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
    ]);
    if (error)
      return NextResponse.json(
        { success: false, message: error },
        { status: 403 }
      );

    await connectDB();

    const totalUsers = await User.countDocuments();
   const totalBlockedUsers = await User.countDocuments({isActive:false});

    const totalPaidUsers = (
      await PlanPurchase.distinct("userId", { status: 1 })
    ).length;

    const totalFreeUsers = totalUsers - totalPaidUsers;

    const totalEWalletBalance = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$topupWalletBalance" } } },
    ]);

    const totalInvestment = await PlanPurchase.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    console.log("total investment", totalInvestment);
    const totalKycApproved = await Kyc.countDocuments({ status: 1 });
    const totalKycPending = await Kyc.countDocuments({ status: 0 });

    const monthlySignup = await User.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const months = [
      "",
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlySignupFormatted = monthlySignup.map((item) => ({
      month: months[item._id],
      count: item.count,
    }));

    const revenueData = await PlanPurchase.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const revenueFormatted = revenueData.map((item) => ({
      month: months[item._id],
      amount: item.amount,
    }));

    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(10);

    const formattedTransactions = recentTransactions.map((txn: any) => ({
      _id: txn._id,
      userId: txn.userId,
      amount: txn.amount,
      source: txn.source,
      type: txn.type,
      date: txn.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        // Basic Stats
        totalUsers,
        totalPaidUsers,
        totalFreeUsers,
        totalBlockedUsers,
        totalWalletBalance: totalEWalletBalance[0]?.total || 0,
        totalInvestment: totalInvestment[0]?.total || 0,
        totalKycApproved,
        totalKycPending,

        // Charts
        monthlySignup: monthlySignupFormatted,
        revenueData: revenueFormatted,

        // Table
        recentTransactions: formattedTransactions,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
