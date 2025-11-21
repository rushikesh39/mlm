import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICommission extends Document {
  sourceUser: mongoose.Types.ObjectId;
  receiverUser: mongoose.Types.ObjectId;
  level: number;
  amount: number;
  description?: string;
  isPaid: boolean;
}

const commissionSchema = new Schema<ICommission>(
  {
    sourceUser: { type: Schema.Types.ObjectId, ref: "User" },
    receiverUser: { type: Schema.Types.ObjectId, ref: "User" },
    level: { type: Number, required: true },
    amount: { type: Number, required: true },
    description: String,
    isPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

commissionSchema.index({ receiverUser: 1, level: 1 });

export const Commission: Model<ICommission> =
  mongoose.models.Commission ||
  mongoose.model<ICommission>("Commission", commissionSchema);
