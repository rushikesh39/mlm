import { NextResponse } from "next/server";
import { User } from "@/app/(backend)/models/user.model";
import { connectDB } from "@/app/(backend)/lib/db";
import { verifyToken } from "@/app/(backend)/utils/generateToken";

export async function GET(req: Request) {
  try {
    await connectDB();

    // Read token from headers
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded?.userId) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const user = await User.findOne({userId:decoded.userId}).select("topupWalletBalance");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    console.log("user", user)
    return NextResponse.json(
      {
        success: true,
        user: user,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Server error" },
      { status: 500 }
    );
  }
}
