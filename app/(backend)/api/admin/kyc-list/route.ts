import { NextResponse } from "next/server";
import { connectDB } from "@/app/(backend)/lib/db";
import { Kyc } from "@/app/(backend)/models/kyc.model";
import { requireAuth } from "@/app/(backend)/middleware/auth";
import { USER_ROLES } from "@/app/(backend)/config/roles";
import * as XLSX from "xlsx";

/**
 * @route GET /api/admin/kyc-list
 * @query ?status=0|1|2|all&search=abc&page=1&limit=10&export=excel
 */
export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const exportExcel = searchParams.get("export") === "excel";

    const query: any = {};

    if (status && status !== "all") query.status = parseInt(status);
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: "i" } },
        { userId: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Kyc.countDocuments(query);
    const kycs = await Kyc.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    if (exportExcel) {
      const worksheet = XLSX.utils.json_to_sheet(
        kycs.map((k) => ({
          UserID: k.userId,
          UserName: k.userName,
          PAN: k.panNumber,
          Aadhar: k.aadharNumber,
          BankName: k.bankName,
          AccountNo: k.accountNumber,
          IFSC: k.ifscCode,
          Status:
            k.status === 0
              ? "Pending"
              : k.status === 1
              ? "Approved"
              : "Rejected",
          Remarks: k.remarks || "",
          CreatedOn: k.createdAt ? new Date(k.createdAt).toLocaleString() : "—",

        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "KYC");
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      return new Response(buffer, {
        headers: {
          "Content-Disposition": "attachment; filename=kyc_data.xlsx",
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });
    }

    return NextResponse.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      kycs,
    });
  } catch (err: any) {
    console.error("❌ Error fetching KYC list:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
