import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { canAccessProject, isProjectAdmin } from "@/lib/rbac";
import { projectSchema } from "@/lib/validators";

type Context = {
  params: { projectId: string };
};

export async function GET(req: Request, { params }: Context) {
  const user = await getCurrentUser(req);
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const allowed = await canAccessProject(user.id, params.projectId);
  if (!allowed) {
    return fail("Forbidden", 403);
  }

  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { tasks: true, members: true } },
    },
  });
  if (!project) {
    return fail("Project not found", 404);
  }

  return ok({ project });
}

export async function DELETE(req: Request, { params }: Context) {
  const user = await getCurrentUser(req);
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const admin = await isProjectAdmin(user.id, params.projectId);
  if (!admin) {
    return fail("Only admins can delete projects", 403);
  }

  await prisma.project.delete({ where: { id: params.projectId } });
  return ok({ message: "Project deleted" });
}

export async function PATCH(req: Request, { params }: Context) {
  const user = await getCurrentUser(req);
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const admin = await isProjectAdmin(user.id, params.projectId);
  if (!admin) {
    return fail("Only admins can edit projects", 403);
  }

  const body = await req.json();
  const parsed = projectSchema.partial().safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid payload", 422);
  }

  const project = await prisma.project.update({
    where: { id: params.projectId },
    data: parsed.data,
    include: {
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { tasks: true, members: true } },
    },
  });

  return ok({ project });
}
