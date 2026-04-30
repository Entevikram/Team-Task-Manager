import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validators";

export async function GET(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const projects = await prisma.project.findMany({
    where: {
      OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
    },
    include: {
      _count: { select: { tasks: true, members: true } },
      owner: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return ok({ projects });
}

export async function POST(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const body = await req.json();
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid payload", 422);
  }

  const project = await prisma.project.create({
    data: {
      ...parsed.data,
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: user.role === "ADMIN" ? "ADMIN" : "MEMBER",
        },
      },
    },
    include: { owner: { select: { id: true, name: true, email: true } } },
  });

  return ok({ project }, 201);
}
