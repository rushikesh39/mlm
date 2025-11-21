import { NextResponse } from "next/server";
import { connectDB } from "@/app/(backend)/lib/db";
import { Kyc } from "@/app/(backend)/models/kyc.model";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ success: false, message: "Missing userId" });

    const kyc = await Kyc.findOne({ userId });
    if (!kyc) return NextResponse.json({ success: true, status: null });

    return NextResponse.json({ success: true, status: kyc.status });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
