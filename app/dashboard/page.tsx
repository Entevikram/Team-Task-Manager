import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  let projects: Array<{
    id: string;
    name: string;
    _count: { tasks: number; members: number };
  }> = [];
  let overdueTasks = 0;

  try {
    projects = await prisma.project.findMany({
      include: { _count: { select: { tasks: true, members: true } } },
      orderBy: { createdAt: "desc" },
    });
    overdueTasks = await prisma.task.count({
      where: { dueDate: { lt: new Date() }, status: { not: "DONE" } },
    });
  } catch {
    projects = [];
    overdueTasks = 0;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Project Dashboard</h1>
      <p className="mb-6 text-gray-600">Overdue tasks: {overdueTasks}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((p) => (
          <div key={p.id} className="border p-4 rounded-lg shadow">
            <h2 className="font-semibold">{p.name}</h2>
            <p className="text-sm text-gray-500">{p._count.tasks} Tasks</p>
            <p className="text-sm text-gray-500">{p._count.members} Members</p>
          </div>
        ))}
      </div>
    </div>
  );
}