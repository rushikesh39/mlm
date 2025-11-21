import { User} from "../models/user.model";
import { hashPassword } from "../utils/hashPassword";
import { generateUniqueUserId } from "../utils/generateUserId";
import { comparePassword } from "../utils/hashPassword";
import { connectDB } from "../lib/db";
import { generateToken } from "../utils/generateToken";

export async function registerUser(data: {
  fullName: string;
  email: string;
  password: string;
  sponsorId?: string;
}) {
  await connectDB();

  const { fullName, email, password, sponsorId } = data;

  // Check if user already exists
  const existing = await User.findOne({ email });
  if (existing) throw new Error("Email already registered.");

  // Generate unique 6-digit userId
  const userId = await generateUniqueUserId();

  // Hash password
  const hashed = await hashPassword(password);

  // Validate sponsor if provided
  let sponsor = null;
  if (sponsorId) {
    sponsor = await User.findOne({ userId: sponsorId });
    if (!sponsor) throw new Error("Invalid sponsor ID");
  }

  const newUser = await User.create({
    userId,
    fullName,
    email,
    password: hashed,
    sponsorId: sponsor?.userId,
  });

  // Add user to sponsor’s referrals
  if (sponsor) {
    // sponsor.referrals.push(newUser._id);
  sponsor.referrals.push(newUser.userId);
    await sponsor.save();
  }

  return {
    userId: newUser.userId,
    fullName: newUser.fullName,
    email: newUser.email,
  };
}
export async function loginUser(data: { userIdOrEmail: string; password: string }) {
  await connectDB();

  const { userIdOrEmail, password } = data;

  const user = await User.findOne({
    $or: [{ userId: userIdOrEmail }, { email: userIdOrEmail }],
  });

  if (!user) {
    throw new Error("Invalid user ID or email");
  }

  if (!user.isActive) {
    throw new Error("Account is inactive. Please contact admin.");
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }
const token = generateToken({
    userId: user.userId,
    fullName:user.fullName,
    role: user.role,
    email: user.email,
  });

  return {
    success: true,
    message: "Login successful ✅",
    token,
    user: {
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  };
}