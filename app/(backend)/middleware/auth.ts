import { NextResponse } from "next/server";
import { verifyToken } from "../utils/generateToken";
import { USER_ROLES } from "../config/roles";

export interface AuthUser {
  userId: string;
  email: string;
  role: number;
}

export function requireAuth(req: Request, allowedRoles: number[] = []) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { error: "Unauthorized: Missing token" };
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as AuthUser | null;

    if (!decoded) return { error: "Invalid or expired token" };

    // Role-based restriction
    if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
      return { error: "Access denied: insufficient permissions" };
    }

    return { user: decoded };
  } catch (err: any) {
    return { error: "Unauthorized: " + err.message };
  }
}
