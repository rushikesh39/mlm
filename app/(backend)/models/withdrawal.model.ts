import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWithdrawal extends Document {
  userId: string;
  amount: number;
  method: "upi" | "bank" | "wallet";
  accountInfo: Record<string, string>;
  status: "pending" | "approved" | "rejected";
  processedBy?: string; // super_admin/admin userId
  remarks?: string;
}

const withdrawalSchema = new Schema<IWithdrawal>(
  {
    userId: { type: String, ref: "User", required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ["upi", "bank", "wallet"], required: true },
    accountInfo: { type: Object, default: {} },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // processedBy (admin/super_admin userId)
    processedBy: { type: String, ref: "User" },

    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

// Index for performance
withdrawalSchema.index({ userId: 1 });
withdrawalSchema.index({ status: 1 });

export const Withdrawal: Model<IWithdrawal> =
  mongoose.models.Withdrawal ||
  mongoose.model<IWithdrawal>("Withdrawal", withdrawalSchema);
