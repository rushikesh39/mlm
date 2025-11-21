import { NextResponse } from "next/server";
import { connectDB } from "@/app/(backend)/lib/db";
import { Plan } from "@/app/(backend)/models/plan.model";

export async function GET() {
  try {
    await connectDB();

    const plans = await Plan.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      plans,
    });
  } catch (err: any) {
    console.error("❌ Error fetching plans:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      name,
      type,
      amount,
      dailyCommission,
      monthlyCommission,
      description,
      levels,
    } = body;

    if (!name || dailyCommission === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, amount and daily commission are required",
        },
        { status: 400 }
      );
    }

    const existing = await Plan.findOne({ name });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Plan with this name already exists" },
        { status: 409 }
      );
    }

    const newPlan = await Plan.create({
      name,
      type,
      amount,
      dailyCommission,
      monthlyCommission,
      description,
      levels,
    });

    return NextResponse.json({
      success: true,
      message: "Plan created successfully",
      plan: newPlan,
    });
  } catch (err: any) {
    console.error("❌ Error creating plan:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Plan ID required" },
        { status: 400 }
      );
    }

    const updated = await Plan.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Plan updated successfully",
      plan: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    );
  }
}
