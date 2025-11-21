import { NextResponse } from "next/server";
import { connectDB } from "@/app/(backend)/lib/db";
import { User } from "@/app/(backend)/models/user.model";
import { Kyc } from "@/app/(backend)/models/kyc.model";

export async function GET(req: Request) {
  try {
    await connectDB();

    // ✅ Extract userId from query params
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Missing userId" },
        { status: 400 }
      );
    }

    // ✅ Fetch user from database
    const user = await User.findOne({ userId });
    const kyc = await Kyc.findOne({ userId });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // ✅ Construct dashboard data
    const dashboardData = {
      topupWalletBalance: user.topupWalletBalance || 0,
      totalInvestment: user.totalEarnings || 0,
      referralCount: user.referrals.length,
      kycStatus:kyc?.status||undefined,
    };

    return NextResponse.json({ success: true, data: dashboardData });
  } catch (err: any) {
    console.error("Dashboard API Error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
