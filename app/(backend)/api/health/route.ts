import { NextResponse } from "next/server";
import { connectDB } from "@/app/(backend)/lib/db";
export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ success: true, message: "Database Connected ✅" });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
