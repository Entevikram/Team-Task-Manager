import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/useAuth";
import { projectsApi, taskApi } from "@/services/api";
import type { Project, Task, TaskStatus } from "@/types";

type FilterType = "ALL" | "COMPLETED" | "PENDING" | "OVERDUE";

export function TasksPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  useEffect(() => {
    projectsApi.list().then((res) => {
      setProjects(res.data.projects);
      setProjectId(res.data.projects[0]?.id || "");
      setLoading(false);
    });
  }, []);

  const loadTasks = async (currentProjectId: string) => {
    if (!currentProjectId) return;
    const res = await projectsApi.tasks(currentProjectId);
    setTasks(res.data.tasks);
  };

  useEffect(() => {
    void loadTasks(projectId);
  }, [projectId]);

  const filtered = useMemo(() => {
    const now = new Date();
    const scoped = user?.role === "MEMBER" ? tasks.filter((task) => task.assigneeId === user.id) : tasks;
    return scoped.filter((task) => {
      if (filter === "ALL") return true;
      if (filter === "COMPLETED") return task.status === "DONE";
      if (filter === "PENDING") return task.status !== "DONE";
      return Boolean(task.dueDate && new Date(task.dueDate) < now && task.status !== "DONE");
    });
  }, [filter, tasks, user]);

  const createTask = async () => {
    if (!projectId || !title.trim()) return;
    await projectsApi.createTask(projectId, {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      assigneeId: assigneeId || undefined,
    });
    setTitle("");
    setDescription("");
    setDueDate("");
    setAssigneeId("");
    await loadTasks(projectId);
  };

  const updateStatus = async (taskId: string, status: TaskStatus) => {
    await taskApi.update(taskId, { status });
    await loadTasks(projectId);
  };

  const deleteTask = async (taskId: string) => {
    await taskApi.remove(taskId);
    await loadTasks(projectId);
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Tasks</h2>
      <Card className="space-y-3">
        <select
          className="h-10 rounded-md border px-3 text-sm"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        {user?.role === "ADMIN" && (
          <>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Input
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              <Input
                placeholder="Assignee user id"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              />
            </div>
            <Button onClick={createTask}>Create Task</Button>
          </>
        )}
      </Card>
      <div className="flex flex-wrap gap-2">
        {(["ALL", "COMPLETED", "PENDING", "OVERDUE"] as FilterType[]).map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
            {f}
          </Button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="No tasks in this filter" description="Create or update tasks to see data here." />
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => (
            <Card key={task.id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{task.title}</p>
                <p className="text-xs text-slate-500">{task.description}</p>
                <p className="text-xs text-slate-500">{task.assignee?.name || "Unassigned"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{task.status}</Badge>
                <select
                  className="h-9 rounded border px-2 text-sm"
                  value={task.status}
                  onChange={(e) => updateStatus(task.id, e.target.value as TaskStatus)}
                >
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="DONE">DONE</option>
                </select>
                {(user?.role === "ADMIN" || task.assigneeId === user?.id) && (
                  <Button variant="destructive" size="sm" onClick={() => deleteTask(task.id)}>
                    Delete
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
