import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPlan extends Document {
  name: string;
  type: number;
  amount: number;
  dailyCommission: number;
  monthlyCommission: number;
  description?: string;
  levels: { level: number; commissionPercent: number }[];
  isActive: boolean;
}

const planSchema = new Schema<IPlan>(
  {
    name: { type: String, required: true, unique: true },
    type: { type: Number, enum: [1, 2], default: 1 }, // 1->activation, 2->deposit
    amount: { type: Number, required: true },
    dailyCommission: { type: Number, required: true },
    monthlyCommission: { type: Number, required: true },
    description: { type: String}, 
    levels: [
      {
        level: { type: Number, required: true },
        commissionPercent: { type: Number, required: true },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Prevent model overwrite error in Next.js hot-reloading
export const Plan: Model<IPlan> =
  mongoose.models.Plan || mongoose.model<IPlan>("Plan", planSchema);