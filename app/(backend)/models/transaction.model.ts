import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITransaction extends Document {
  userId: string;
  sponserId?: string;
  type: number;
  subAmount: number;
  charges: number;
  amount: number;
  percentage?: number;
  planId?: mongoose.Types.ObjectId;
  level?: number;
  source: number;
  description?: string;
  status: number;
  walletType: number;
  hashTxnNo?: string;
  attatchment?: string;
  note?: string;
  paymentDate: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: { type: String, ref: "User", required: true },
    sponserId: { type: String, ref: "User" },
    type: {
      type: Number,
      enum: [1, 2], //1->"credit",2-> "debit"
      required: true,
    },
    subAmount:{ type: Number, required: true },
    amount: { type: Number, required: true },
    percentage: Number,
    planId: { type: Schema.Types.ObjectId, ref: "Plan" },
    source: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7, 8], //1->Topup fund request, 2->withdrawal req, 3->fund transfer,  4->"deposit", 5->daily income 6->monthly income, 7->level income, 8->Direct Income
      required: true,
    },
    description: String,
    status: {
      type: Number,
      enum: [0, 1, 2], // 0->"pending",1->"success",2->"failed"
      default: 0,
    },
    walletType: {
      type: Number,
      enum: [1, 2], // 1->E-wallet , 2->Topup-wallet
    },
    hashTxnNo: { type: String, required: false },
    attatchment: String,
    note: String,
    paymentDate: { type: Date, required: true },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, createdAt: -1 });

export const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", transactionSchema);
