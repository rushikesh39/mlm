import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserPlan extends Document {
  userId: string; // your 6-digit MLM user ID
  planId: mongoose.Types.ObjectId;
  amountPaid: number;
  startDate: Date;
  endDate: Date;
  status: "active" | "expired" | "cancelled";
}

const userPlanSchema = new Schema<IUserPlan>(
  {
    userId: { type: String, ref: "User", required: true },
    planId: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
    amountPaid: { type: Number, required: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true }
);

export const UserPlan: Model<IUserPlan> =
  mongoose.models.UserPlan || mongoose.model<IUserPlan>("UserPlan", userPlanSchema);
