export type Role = "ADMIN" | "MEMBER";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  ownerId?: string;
  _count?: { tasks: number; members: number };
}

export interface Member {
  id: string;
  role: Role;
  user: User;
  projectId: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  status: TaskStatus;
  projectId: string;
  assigneeId?: string | null;
  assignee?: Pick<User, "id" | "name" | "email"> | null;
}
