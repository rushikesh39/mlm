import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * KYC Status Codes:
 * 0 = Pending
 * 1 = Approved
 * 2 = Rejected
 */
export const KYC_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
} as const;

export interface IKyc extends Document {
  userId: string;
  userName: string;
  panNumber: string;
  aadharNumber: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  documentImage?: string;
  status: number; // 0=pending, 1=approved, 2=rejected
  remarks?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const kycSchema = new Schema<IKyc>(
  {
    userId: { type: String, required: true, ref: "User" },
    userName: { type: String, required: true },
    panNumber: { type: String, required: true },
    aadharNumber: { type: String, required: true },
    accountHolderName: { type: String, required: true },
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    documentImage: { type: String },
    status: {
      type: Number,
      enum: [0, 1, 2], // 0 = pending, 1 = approved, 2 = rejected
      default: 0,
    },
    remarks: { type: String },
  },
  { timestamps: true }
);

// Index for faster queries
kycSchema.index({ userId: 1 });

export const Kyc: Model<IKyc> =
  mongoose.models.Kyc || mongoose.model<IKyc>("Kyc", kycSchema, "Kyc");
