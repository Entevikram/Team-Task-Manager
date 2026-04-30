import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Team Task Manager API is running",
    auth: ["/api/auth/signup", "/api/auth/login", "/api/auth/me", "/api/auth/logout"],
  });
}
