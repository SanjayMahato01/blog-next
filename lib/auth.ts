import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing");
}

// Generate JWT
export function generateToken(userId: string) {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Set JWT cookie
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    return await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
    });
  } catch {
    return null;
  }
}