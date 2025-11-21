import { NextResponse } from "next/server";
import { connectDB } from "@/app/(backend)/lib/db";
import { Kyc } from "@/app/(backend)/models/kyc.model";

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { kycId, status, remarks } = await req.json();
    console.log("remark",remarks);

    if (!kycId || typeof status !== "number") {
      return NextResponse.json(
        { success: false, message: "Invalid parameters" },
        { status: 400 }
      );
    }

    // Require remarks if rejecting
    if (status === 2 && (!remarks || !remarks.trim())) {
      return NextResponse.json(
        { success: false, message: "Remarks are required for rejection." },
        { status: 400 }
      );
    }

    const updated = await Kyc.findByIdAndUpdate(
      kycId,
      { status, remarks: remarks || "" },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "KYC record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        status === 1
          ? "KYC approved successfully"
          : "KYC rejected successfully",
      updated,
    });
  } catch (err: any) {
    console.error("❌ KYC update error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    );
  }
}
