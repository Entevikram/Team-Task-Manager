import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, TOKEN_EXPIRY_SECONDS } from "@/lib/constants";
import { createAuthToken } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid payload", 422);
  }

  const { name, email, password, role } = parsed.data;
  // Normalize email to lowercase
  const normalizedEmail = email.toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    return fail("Email already registered", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email: normalizedEmail, passwordHash, role: role ?? "MEMBER" },
    select: { id: true, name: true, email: true, role: true },
  });

  const token = await createAuthToken({ userId: user.id, role: user.role });
  const response = ok({ user, token }, 201);
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: TOKEN_EXPIRY_SECONDS,
    path: "/",
  });
  return response;
}

export async function GET() {
  return NextResponse.json({ message: "Use POST /api/auth/signup" });
}
