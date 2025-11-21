import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISetting extends Document {
  key: string;
  value: any;
}

const settingSchema = new Schema<ISetting>(
  {
    key: { type: String, unique: true },
    value: Schema.Types.Mixed,
  },
  { timestamps: true }
);

export const Setting: Model<ISetting> =
  mongoose.models.Setting ||
  mongoose.model<ISetting>("Setting", settingSchema);
