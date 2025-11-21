import { NextResponse } from "next/server";
import { connectDB } from "@/app/(backend)/lib/db";
import { User } from "@/app/(backend)/models/user.model";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { sponsorId } = await req.json();

    if (!sponsorId) {
      return NextResponse.json({ valid: false, message: "Sponsor ID is required" });
    }

    const sponsor = await User.findOne({ userId: sponsorId });

    if (sponsor) {
      return NextResponse.json({ valid: true, message: "Valid Sponsor ✅", name: sponsor.fullName });
    } else {
      return NextResponse.json({ valid: false, message: "Invalid Sponsor ID ❌" });
    }
  } catch (err) {
    return NextResponse.json({ valid: false, message: "Error validating sponsor" }, { status: 500 });
  }
}
