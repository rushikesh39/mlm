import { User } from "../models/user.model";

/**
 * Generates a unique 6-digit user ID.
 * Checks database to ensure no duplicate exists.
 */
export async function generateUniqueUserId(): Promise<string> {
  let userId: string;
  let isUnique = false;
  let attempts = 0;

  while (!isUnique) {
    attempts++;
    if (attempts > 10) {
      throw new Error("Failed to generate unique userId after 10 attempts");
    }

    // Generate random 6-digit number
    userId = Math.floor(100000 + Math.random() * 900000).toString();

    // Check if userId already exists
    const existingUser = await User.findOne({ userId });
    if (!existingUser) {
      isUnique = true;
    }
  }

  return userId!;
}
