import { NextResponse } from "next/server";
import { connectDB } from "@/app/(backend)/lib/db";
import { User } from "@/app/(backend)/models/user.model";
import { Kyc } from "@/app/(backend)/models/kyc.model";
import { requireAuth } from "@/app/(backend)/middleware/auth";
import { USER_ROLES } from "@/app/(backend)/config/roles";

export async function GET(req: Request) {
  try {
    // ✅ Auth check
    const { user, error } = requireAuth(req, [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]);
    if (error)
      return NextResponse.json({ success: false, message: error }, { status: 403 });

    await connectDB();

    // ✅ User statistics
    const totalUsers = await User.countDocuments();
    const totalPaidUsers = await User.countDocuments({
      isActive: true,
      role: 0,
      totalEarnings: { $gt: 0 },
    });
    const totalFreeUsers = totalUsers - totalPaidUsers;

    const totalEWalletBalance = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$topupWalletBalance" } } },
    ]);

    const totalInvestment = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$totalEarnings" } } },
    ]);

    // ✅ Dynamic KYC data
    const totalKycApproved = await Kyc.countDocuments({ status:1 });
    const totalKycPending = await Kyc.countDocuments({ status:0 });

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalPaidUsers,
        totalFreeUsers,
        totalWalletBalance: totalEWalletBalance[0]?.total || 0,
        totalInvestment: totalInvestment[0]?.total || 0,
        totalKycApproved,
        totalKycPending,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
