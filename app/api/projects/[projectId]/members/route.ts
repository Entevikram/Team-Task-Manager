import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { isProjectAdmin } from "@/lib/rbac";
import { addMemberSchema } from "@/lib/validators";

type Context = {
  params: { projectId: string };
};

export async function GET(req: Request, { params }: Context) {
  const user = await getCurrentUser(req);
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const canRead = await prisma.project.findFirst({
    where: {
      id: params.projectId,
      OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
    },
  });
  if (!canRead) {
    return fail("Forbidden", 403);
  }

  const members = await prisma.projectMember.findMany({
    where: { projectId: params.projectId },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  return ok({ members });
}

export async function POST(req: Request, { params }: Context) {
  const user = await getCurrentUser(req);
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const admin = await isProjectAdmin(user.id, params.projectId);
  if (!admin) {
    return fail("Only project admins can add members", 403);
  }

  const body = await req.json();
  const parsed = addMemberSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid payload", 422);
  }

  const exists = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
  if (!exists) {
    return fail("User not found", 404);
  }

  const member = await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId: params.projectId,
        userId: parsed.data.userId,
      },
    },
    update: { role: parsed.data.role ?? "MEMBER" },
    create: {
      projectId: params.projectId,
      userId: parsed.data.userId,
      role: parsed.data.role ?? "MEMBER",
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return ok({ member }, 201);
}

export async function DELETE(req: Request, { params }: Context) {
  const user = await getCurrentUser(req);
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const admin = await isProjectAdmin(user.id, params.projectId);
  if (!admin) {
    return fail("Only project admins can remove members", 403);
  }

  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  if (!userId) {
    return fail("userId is required", 422);
  }

  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
    select: { ownerId: true },
  });
  if (project?.ownerId === userId) {
    return fail("Owner cannot be removed from project", 422);
  }

  await prisma.projectMember.deleteMany({
    where: { projectId: params.projectId, userId },
  });
  return ok({ message: "Member removed" });
}
