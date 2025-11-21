import { NextResponse } from "next/server";
import { connectDB } from "@/app/(backend)/lib/db";
import { Kyc } from "@/app/(backend)/models/kyc.model";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId,userName, panNumber, aadharNumber,accountHolderName, bankName, accountNumber, ifscCode, documentImage } = body;

    if (!userId || !panNumber || !aadharNumber ||!accountHolderName|| !bankName || !accountNumber || !ifscCode) {
      return NextResponse.json({ success: false, message: "All fields are required" });
    }

    const existing = await Kyc.findOne({ userId });
    if (existing) {
      return NextResponse.json({ success: false, message: "KYC already submitted" });
    }

    const kyc = await Kyc.create({
      userId,
      userName,
      panNumber,
      aadharNumber,
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode,
      documentImage,
    });

    return NextResponse.json({ success: true, message: "KYC submitted successfully", kyc });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
