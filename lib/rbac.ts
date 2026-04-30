import { prisma } from "@/lib/prisma";

export async function canAccessProject(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    select: { id: true },
  });

  return Boolean(project);
}

export async function isProjectAdmin(userId: string, projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (project?.ownerId === userId) {
    return true;
  }

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    select: { role: true },
  });

  return member?.role === "ADMIN";
}
