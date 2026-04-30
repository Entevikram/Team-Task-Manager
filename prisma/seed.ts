import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

// Connection string from .env - postgresql://postgres:fhgofKHbHsyMWujHEPvEndFqyGEtxDSV@switchyard.proxy.rlwy.net:20496/railway
const connectionString = "postgresql://postgres:fhgofKHbHsyMWujHEPvEndFqyGEtxDSV@switchyard.proxy.rlwy.net:20496/railway";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean up existing data
  await prisma.projectMember.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@example.com",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("Created admin:", admin.email);

  // Create 4 members
  const memberPassword = await bcrypt.hash("member123", 10);
  const members = await Promise.all([
    prisma.user.create({
      data: { name: "Raju Ravi Ram Sai", email: "member1@example.com", passwordHash: memberPassword, role: "MEMBER" },
    }),
    prisma.user.create({
      data: { name: "Member Two", email: "member2@example.com", passwordHash: memberPassword, role: "MEMBER" },
    }),
    prisma.user.create({
      data: { name: "Member Three", email: "member3@example.com", passwordHash: memberPassword, role: "MEMBER" },
    }),
    prisma.user.create({
      data: { name: "Member Four", email: "member4@example.com", passwordHash: memberPassword, role: "MEMBER" },
    }),
  ]);
  console.log("Created 4 members");

  // Create 4 projects
  const projects = await Promise.all([
    prisma.project.create({
      data: { name: "Project One", description: "First project", ownerId: admin.id },
    }),
    prisma.project.create({
      data: { name: "Project Two", description: "Second project", ownerId: admin.id },
    }),
    prisma.project.create({
      data: { name: "Project Three", description: "Third project", ownerId: admin.id },
    }),
    prisma.project.create({
      data: { name: "Project Four", description: "Fourth project", ownerId: admin.id },
    }),
  ]);
  console.log("Created 4 projects");

  // Create members for each project
  for (const project of projects) {
    for (const member of members) {
      await prisma.projectMember.create({
        data: { projectId: project.id, userId: member.id, role: "MEMBER" },
      });
    }
  }
  console.log("Added members to projects");

  // Create 4 tasks per project with various statuses
  const statuses = ["TODO", "IN_PROGRESS", "DONE", "TODO"] as const;
  const taskTitles = ["Task One", "Task Two", "Task Three", "Task Four"];

  for (const project of projects) {
    for (let i = 0; i < 4; i++) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (i === 0 ? -5 : i === 1 ? 0 : i === 2 ? 7 : 14));

      await prisma.task.create({
        data: {
          title: taskTitles[i],
          description: `Description for ${taskTitles[i]} in ${project.name}`,
          status: statuses[i],
          projectId: project.id,
          assigneeId: members[i]?.id || null,
          createdById: admin.id,
          dueDate,
        },
      });
    }
  }
  console.log("Created 4 tasks per project");

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });