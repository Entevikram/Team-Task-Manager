import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";

export async function GET(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) {
    return fail("Unauthorized", 401);
  }

  return ok({ user });
}
