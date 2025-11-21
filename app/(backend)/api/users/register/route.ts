import { NextResponse } from "next/server";
import { registerUser } from "@/app/(backend)/controller/auth.controller";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const response = await registerUser(body);
    return NextResponse.json(response, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Something went wrong" },
      { status: 400 }
    );
  }
}
