import { NextResponse } from "next/server";
import { connectDB } from "@/app/(backend)/lib/db";
import { Kyc } from "@/app/(backend)/models/kyc.model";

export async function DELETE(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { kycId } = body;

    if (!kycId) {
      return NextResponse.json(
        { success: false, message: "KYC ID is required" },
        { status: 400 }
      );
    }

    const deleted = await Kyc.findByIdAndDelete(kycId);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "KYC record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "KYC record deleted successfully",
    });
  } catch (err: any) {
    console.error("❌ Error deleting KYC:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
