import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  mobile?: string;
  password: string;
  role: number; // 0 = user, 1 = admin, 2 = super_admin
  userId: string; // 6-digit unique system ID
  sponsorId: string;
  referrals: string[];
  eWalletBalance: number;
  topupWalletBalance: number;
  totalEarnings: number;
  totalWithdrawn: number;
  profileImage?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Role mapping for readability
export const USER_ROLES = {
  USER: 0,
  ADMIN: 1,
  SUPER_ADMIN: 2,
} as const;

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    mobile: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    role: {
      type: Number,
      enum: [0, 1, 2], // 0=user, 1=admin, 2=super_admin
      default: 0,
      immutable: true,
    },

    // Unique 6-digit system ID (also acts as referral code)
    userId: { type: String, unique: true, required: true },
    sponsorId: { type: String, required: true },
    referrals: [],
    eWalletBalance: { type: Number, default: 0 },
    topupWalletBalance: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 },
    profileImage: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ userId: 1 });
userSchema.index({ sponsorId: 1 });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema, "User");
