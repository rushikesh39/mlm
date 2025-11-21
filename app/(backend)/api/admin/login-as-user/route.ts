import { NextResponse } from "next/server";
import { connectDB } from "@/app/(backend)/lib/db";
import { User } from "@/app/(backend)/models/user.model";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { userId } = await req.json();

    const user = await User.findOne({ userId });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "2h" }
    );

    return NextResponse.json({ success: true, token });
  } catch (err: any) {
    console.error("Error logging in as user:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
