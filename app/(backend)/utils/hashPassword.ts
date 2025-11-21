import bcrypt from "bcrypt";

/**
 * Hash a plain-text password securely.
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare plain password with stored hashed password.
 */
export async function comparePassword(
  enteredPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(enteredPassword, hashedPassword);
}
