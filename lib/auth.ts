import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { AUTH_COOKIE_NAME, TOKEN_EXPIRY_SECONDS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const secretKey = new TextEncoder().encode(JWT_SECRET);

type TokenPayload = {
  userId: string;
  role: "ADMIN" | "MEMBER";
};

export async function createAuthToken(payload: TokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_EXPIRY_SECONDS}s`)
    .sign(secretKey);
}

export async function verifyAuthToken(token: string) {
  const verified = await jwtVerify<TokenPayload>(token, secretKey);
  return verified.payload;
}

function extractBearerToken(authHeader?: string | null) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}

export async function getCurrentUser(req?: Request) {
  const cookieToken = cookies().get(AUTH_COOKIE_NAME)?.value;
  const headerToken = extractBearerToken(req?.headers.get("authorization"));
  const token = headerToken || cookieToken;
  if (!token) {
    return null;
  }

  try {
    const payload = await verifyAuthToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true },
    });
    return user;
  } catch {
    return null;
  }
}
