import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "MEMBER"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "MEMBER"]).optional(),
});

export const projectSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

export const addMemberSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["ADMIN", "MEMBER"]).optional(),
});

export const taskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  assigneeId: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
});

export const updateTaskSchema = taskSchema.partial();
