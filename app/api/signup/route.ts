import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { generateToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string" ||
        password.length < 8 ||
        password.length > 72) {
      return NextResponse.json(
        { message: "Invalid input or password length" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // Generate JWT
    const token = generateToken(user.id);

    // Set cookie
    await setAuthCookie(token);

    return NextResponse.json(
      {
        message: "User registered successfully",
        user,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Signup error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}