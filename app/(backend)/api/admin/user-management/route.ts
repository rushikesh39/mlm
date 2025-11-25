import { NextResponse } from "next/server";
import { connectDB } from "@/app/(backend)/lib/db";
import { User } from "@/app/(backend)/models/user.model";
import bcrypt from "bcrypt";
import * as XLSX from "xlsx";
import { parse, startOfDay, endOfDay } from "date-fns";


/**
 * @route GET /api/admin/users
 * @query ?page=1&limit=10&search=&filter=all|active|inactive&export=excel
 */
export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const filter = searchParams.get("filter") || "all";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const exportExcel = searchParams.get("export") === "excel";

    // 🔹 Base query (only regular users)
    const query: any = { role: 0 };

    // 🔹 Apply filters
    if (filter === "active") query.isActive = true;
    if (filter === "inactive") query.isActive = false;

    // 🔹 Apply Date Filter (startDate & endDate)
    if (startDate) {
      const parsedStart = parse(startDate, "yyyy-MM-dd", new Date());
      query.createdAt = { ...query.createdAt, $gte: startOfDay(parsedStart) };
    }

    if (endDate) {
      const parsedEnd = parse(endDate, "yyyy-MM-dd", new Date());
      query.createdAt = { ...query.createdAt, $lte: endOfDay(parsedEnd) };
    }

    // 🔹 Apply search
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { userId: { $regex: search, $options: "i" } },
      ];
    }

    // 🔹 Fetch total count and data
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // 🔹 Handle Excel Export
    if (exportExcel) {
      const worksheet = XLSX.utils.json_to_sheet(
        users.map((u) => ({
          UserID: u.userId,
          FullName: u.fullName,
          Email: u.email,
          SponsorID: u.sponsorId || "-",
          WalletBalance: u.topupWalletBalance,
          TotalEarnings: u.totalEarnings,
          TotalWithdrawn: u.totalWithdrawn,
          Status: u.isActive ? "Active" : "Inactive",
          createdAt: u.createdAt,
        }))
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      return new Response(buffer, {
        headers: {
          "Content-Disposition": "attachment; filename=users_data.xlsx",
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });
    }

    return NextResponse.json({
      success: true,
      total,
      pages: Math.ceil(total / limit),
      users,
    });
  } catch (err: any) {
    console.error("❌ Error fetching users:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * @route PATCH /api/admin/users
 * @desc Update user info or toggle status
 */
export async function PATCH(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, updateData } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID required" },
        { status: 400 }
      );
    }

    // 🔹 Secure password hashing
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    // 🔹 Prevent unauthorized role changes
    delete updateData.role;

    const updatedUser = await User.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err: any) {
    console.error("❌ Error updating user:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
