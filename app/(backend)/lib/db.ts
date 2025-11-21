import mongoose from "mongoose";

// ✅ Prevent multiple connection instances in Next.js (Hot Reload Safe)
let isConnected = false; // track the connection state

export const connectDB = async (): Promise<void> => {
  if (isConnected) {
    console.log("✅ MongoDB already connected.");
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI as string;

    if (!mongoUri) {
      throw new Error("❌ MONGODB_URI is missing in .env.local");
    }

    const db = await mongoose.connect(mongoUri, {
      dbName: "mlm", // your DB name
    });

    isConnected = !!db.connections[0].readyState;
    console.log("🚀 MongoDB connected successfully:", db.connection.name);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    throw new Error("Database connection error");
  }
};
