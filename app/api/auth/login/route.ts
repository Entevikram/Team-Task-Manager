import bcrypt from "bcryptjs";
import { AUTH_COOKIE_NAME, TOKEN_EXPIRY_SECONDS } from "@/lib/constants";
import { createAuthToken } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid payload", 422);
  }

  const { email, password, role } = parsed.data;
  // Normalize email to lowercase for comparison
  const normalizedEmail = email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, name: true, email: true, passwordHash: true, role: true },
  });
  if (!user) {
    return fail("Invalid email or password", 401);
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    return fail("Invalid email or password", 401);
  }

  // Validate role if provided
  if (role && user.role !== role) {
    return fail(`Invalid credentials. Please login as ${user.role.toLowerCase()} instead.`, 401);
  }

  const token = await createAuthToken({ userId: user.id, role: user.role });
  const response = ok({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  });
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: TOKEN_EXPIRY_SECONDS,
    path: "/",
  });
  return response;
}
