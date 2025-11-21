import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWallet extends Document {
  userId: string;
  balance: number;
  transactions: {
    type:number; //"credit" | "debit";
    amount: number;
    description: string;
    status: number; //"pending" | "completed" | "rejected";
    referenceUserId?: string; // for transfers
  }[];
}

const walletSchema = new Schema<IWallet>(
  {
    userId: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0 },
    transactions: [
      {
        type: {
          type: Number,
          enum: [1,2],//["credit", "debit"],
          required: true,
        },
        amount: { type: Number, required: true },
        description: { type: String },
        status: {
          type:Number,
          enum: [0,1,2],//["pending", "completed", "rejected"],
          default: 0,
        },
        referenceUserId: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const Wallet: Model<IWallet> =
  mongoose.models.Wallet || mongoose.model<IWallet>("Wallet", walletSchema, "Wallets");
