import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { canAccessProject } from "@/lib/rbac";
import { updateTaskSchema } from "@/lib/validators";

type Context = {
  params: { taskId: string };
};

export async function PATCH(req: Request, { params }: Context) {
  const user = await getCurrentUser(req);
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const task = await prisma.task.findUnique({ where: { id: params.taskId } });
  if (!task) {
    return fail("Task not found", 404);
  }

  const allowed = await canAccessProject(user.id, task.projectId);
  if (!allowed) {
    return fail("Forbidden", 403);
  }

  const body = await req.json();
  const parsed = updateTaskSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid payload", 422);
  }

  if (parsed.data.assigneeId) {
    const assignee = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: task.projectId,
          userId: parsed.data.assigneeId,
        },
      },
    });
    if (!assignee) {
      return fail("Assignee is not a member of this project", 422);
    }
  }

  const updatedTask = await prisma.task.update({
    where: { id: params.taskId },
    data: {
      ...parsed.data,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  return ok({ task: updatedTask });
}

export async function DELETE(req: Request, { params }: Context) {
  const user = await getCurrentUser(req);
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const task = await prisma.task.findUnique({ where: { id: params.taskId } });
  if (!task) {
    return fail("Task not found", 404);
  }

  const allowed = await canAccessProject(user.id, task.projectId);
  if (!allowed) {
    return fail("Forbidden", 403);
  }

  await prisma.task.delete({ where: { id: params.taskId } });
  return ok({ message: "Task deleted" });
}
