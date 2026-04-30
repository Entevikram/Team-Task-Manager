import { http } from "@/services/http";
import type { Member, Project, Task, User } from "@/types";

export const authApi = {
  login: (payload: { email: string; password: string; role?: "ADMIN" | "MEMBER" }) =>
    http.post<{ user: User; token: string }>("/auth/login", payload),
  signup: (payload: {
    name: string;
    email: string;
    password: string;
    role: "ADMIN" | "MEMBER";
  }) => http.post<{ user: User; token: string }>("/auth/signup", payload),
  me: () => http.get<{ user: User }>("/auth/me"),
  logout: () => http.post("/auth/logout"),
};

export const dashboardApi = {
  stats: () =>
    http.get<{
      metrics: {
        totalProjects: number;
        totalTasks: number;
        doneTasks: number;
        overdueTasks: number;
      };
      projects: Array<Project & { tasks: Task[] }>;
    }>("/dashboard"),
};

export const projectsApi = {
  list: () => http.get<{ projects: Project[] }>("/projects"),
  create: (payload: { name: string; description?: string }) =>
    http.post<{ project: Project }>("/projects", payload),
  details: (projectId: string) => http.get<{ project: Project }>(`/projects/${projectId}`),
  update: (projectId: string, payload: { name?: string; description?: string }) =>
    http.patch<{ project: Project }>(`/projects/${projectId}`, payload),
  remove: (projectId: string) => http.delete(`/projects/${projectId}`),
  members: (projectId: string) =>
    http.get<{ members: Member[] }>(`/projects/${projectId}/members`),
  addMember: (projectId: string, payload: { userId: string; role: "ADMIN" | "MEMBER" }) =>
    http.post(`/projects/${projectId}/members`, payload),
  removeMember: (projectId: string, userId: string) =>
    http.delete(`/projects/${projectId}/members?userId=${userId}`),
  tasks: (projectId: string) => http.get<{ tasks: Task[] }>(`/projects/${projectId}/tasks`),
  createTask: (
    projectId: string,
    payload: {
      title: string;
      description?: string;
      dueDate?: string;
      assigneeId?: string;
      status?: "TODO" | "IN_PROGRESS" | "DONE";
    }
  ) => http.post<{ task: Task }>(`/projects/${projectId}/tasks`, payload),
};

export const taskApi = {
  update: (taskId: string, payload: Partial<Task>) => http.patch(`/tasks/${taskId}`, payload),
  remove: (taskId: string) => http.delete(`/tasks/${taskId}`),
};
