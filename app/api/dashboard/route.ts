import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const today = new Date();
  const projects = await prisma.project.findMany({
    where: {
      OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
    },
    include: {
      tasks: {
        include: { assignee: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  type Task = (typeof projects)[number]["tasks"][number];
  const allTasks: Task[] = projects.flatMap((project) => project.tasks);

  const metrics = {
    totalProjects: projects.length,
    totalTasks: allTasks.length,
    todoTasks: allTasks.filter((task) => task.status === "TODO").length,
    inProgressTasks: allTasks.filter((task) => task.status === "IN_PROGRESS").length,
    doneTasks: allTasks.filter((task) => task.status === "DONE").length,
    overdueTasks: allTasks.filter(
      (task) => task.dueDate && new Date(task.dueDate) < today && task.status !== "DONE",
    ).length,
  };

  return ok({ metrics, projects });
}
