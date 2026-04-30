import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { dashboardApi } from "@/services/api";
import type { Project, Task } from "@/types";

export function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Array<Project & { tasks: Task[] }>>([]);

  useEffect(() => {
    dashboardApi
      .stats()
      .then((res) => setProjects(res.data.projects))
      .finally(() => setLoading(false));
  }, []);

  const tasksPerProject = useMemo(
    () =>
      projects.map((p) => ({
        name: p.name,
        tasks: p.tasks.length,
        done: p.tasks.filter((task) => task.status === "DONE").length,
      })),
    [projects]
  );

  const completionRate = useMemo(() => {
    const total = projects.flatMap((p) => p.tasks).length;
    const done = projects.flatMap((p) => p.tasks).filter((task) => task.status === "DONE").length;
    return total ? Math.round((done / total) * 100) : 0;
  }, [projects]);

  const overdueTrend = useMemo(() => {
    const now = new Date();
    return projects.map((project) => ({
      name: project.name,
      overdue: project.tasks.filter(
        (task) => task.dueDate && new Date(task.dueDate) < now && task.status !== "DONE"
      ).length,
    }));
  }, [projects]);

  // Tasks per member chart
  const tasksPerMember = useMemo(() => {
    const memberMap = new Map<string, { name: string; tasks: number; done: number; overdue: number }>();
    const now = new Date();

    projects.forEach((project) => {
      project.tasks.forEach((task) => {
        const memberName = task.assignee?.name || "Unassigned";
        const existing = memberMap.get(memberName) || { name: memberName, tasks: 0, done: 0, overdue: 0 };
        existing.tasks += 1;
        if (task.status === "DONE") existing.done += 1;
        if (task.dueDate && new Date(task.dueDate) < now && task.status !== "DONE") existing.overdue += 1;
        memberMap.set(memberName, existing);
      });
    });

    return Array.from(memberMap.values());
  }, [projects]);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Reports</h2>
      <Card>
        <p className="text-sm text-slate-500">Completion rate</p>
        <p className="text-3xl font-bold">{completionRate}%</p>
      </Card>
      <Card>
        <h3 className="mb-3 font-medium">Tasks per project</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tasksPerProject}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="tasks" fill="#3b82f6" />
              <Bar dataKey="done" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <h3 className="mb-3 font-medium">Overdue trends</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={overdueTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="overdue" stroke="#dc2626" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      {tasksPerMember.length > 0 && (
        <Card>
          <h3 className="mb-3 font-medium">Tasks per member</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tasksPerMember}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="tasks" fill="#3b82f6" name="Total" />
                <Bar dataKey="done" fill="#16a34a" name="Done" />
                <Bar dataKey="overdue" fill="#dc2626" name="Overdue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}
