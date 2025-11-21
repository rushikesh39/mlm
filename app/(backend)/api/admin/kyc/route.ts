import { NextResponse } from "next/server";
import { connectDB } from "@/app/(backend)/lib/db";
import { Kyc } from "@/app/(backend)/models/kyc.model";

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { kycId, status, remarks } = await req.json();

    if (!kycId || !status) {
      return NextResponse.json({ success: false, message: "Missing KYC ID or status" });
    }

    const validStatus = [1,2];//1 = approved, 2 = rejected
    if (!validStatus.includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid status" });
    }

    const updated = await Kyc.findByIdAndUpdate(
      kycId,
      { status, remarks },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, message: "KYC not found" });
    }

    return NextResponse.json({ success: true, message: "KYC updated", data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
