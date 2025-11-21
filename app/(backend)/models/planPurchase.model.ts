import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPlanPurchase extends Document {
  planId: mongoose.Types.ObjectId;
  userId: string;
  sponserId: string;
  amount: number;
  dailyCommission: number;
  monthlyCommission: number;
  levels: { level: number; commissionPercent: number }[];
  startDate: Date;
  endDate: Date;
  status: number;
}

const PlanPurchaseSchema = new Schema<IPlanPurchase>(
  {
    userId: { type: String, ref: "User", required: true },
    sponserId: { type: String, ref: "User" },
    planId: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
    amount: { type: Number, required: true },
    dailyCommission: { type: Number },
    monthlyCommission: { type: Number },
    levels: [
      {
        level: { type: Number, required: true },
        commissionPercent: { type: Number, required: true },
      },
    ],
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    status: {
      type: Number,
      enum: [0, 1, 2], //0->pending 1->approved 2-> rejected
      default: 0,
    },
  },
  { timestamps: true }
);

export const UserPlan: Model<IPlanPurchase> =
  mongoose.models.PlanPurchase ||
  mongoose.model<IPlanPurchase>("PlanPurchase", PlanPurchaseSchema);
