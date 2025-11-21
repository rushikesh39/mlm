import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET as string ;
const EXPIRES_IN = "7d"; // token valid for 7 days

export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
