import { NextResponse } from "next/server";
import { loginUser } from "@/app/(backend)/controller/auth.controller";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log(body)
    if (!body.userIdOrEmail || !body.password) {
      return NextResponse.json(
        { success: false, message: "User ID or password missing" },
        { status: 400 }
      );
    }

    const response = await loginUser(body);
    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Login failed" },
      { status: 401 }
    );
  }
}
