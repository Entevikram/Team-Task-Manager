import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { canAccessProject } from "@/lib/rbac";
import { taskSchema } from "@/lib/validators";

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

  const tasks = await prisma.task.findMany({
    where: { projectId: params.projectId },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return ok({ tasks });
}

export async function POST(req: Request, { params }: Context) {
  const user = await getCurrentUser(req);
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const allowed = await canAccessProject(user.id, params.projectId);
  if (!allowed) {
    return fail("Forbidden", 403);
  }

  const body = await req.json();
  const parsed = taskSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid payload", 422);
  }

  if (parsed.data.assigneeId) {
    const assigneeMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: params.projectId,
          userId: parsed.data.assigneeId,
        },
      },
    });
    if (!assigneeMember) {
      return fail("Assignee is not a member of this project", 422);
    }
  }

  const task = await prisma.task.create({
    data: {
      ...parsed.data,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      projectId: params.projectId,
      createdById: user.id,
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  return ok({ task }, 201);
}
