import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { ok } from "@/lib/http";

export async function POST() {
  const response = ok({ message: "Logged out" });
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}
