import { useEffect, useMemo, useState } from "react";
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { EmptyState } from "@/components/common/EmptyState";
import { StatCard } from "@/components/common/StatCard";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { dashboardApi } from "@/services/api";
import type { Task } from "@/types";
import { FolderKanban, CheckCircle, Clock, AlertCircle, TrendingUp } from "lucide-react";

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState({
    totalProjects: 0,
    totalTasks: 0,
    doneTasks: 0,
    overdueTasks: 0,
  });
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    dashboardApi
      .stats()
      .then((res) => {
        setMetrics(res.data.metrics);
        setTasks(res.data.projects.flatMap((project) => project.tasks).slice(0, 7));
      })
      .catch(() => setError("Failed to load dashboard."))
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(
    () => [
      { name: "Done", value: metrics.doneTasks, color: "#16a34a" },
      { name: "In Progress", value: Math.max(metrics.totalTasks - metrics.doneTasks - metrics.overdueTasks, 0), color: "#2563eb" },
      { name: "Overdue", value: metrics.overdueTasks, color: "#dc2626" },
    ],
    [metrics]
  );

  const projectData = useMemo(
    () => [
      { name: "Projects", tasks: metrics.totalProjects },
    ],
    [metrics]
  );

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="h-8 w-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500">Overview of your workspace</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-100 p-3">
              <FolderKanban className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Projects</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.totalProjects}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-purple-100 p-3">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Tasks</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.totalTasks}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-green-100 p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Completed</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.doneTasks}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-red-100 p-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Overdue</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.overdueTasks}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 font-semibold text-slate-900">Task Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={2}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 font-semibold text-slate-900">Recent Tasks</h3>
          {tasks.length === 0 ? (
            <EmptyState title="No tasks yet" description="Create a project task to populate this list." />
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{task.title}</p>
                    <p className="text-xs text-slate-500">{task.assignee?.name || "Unassigned"}</p>
                  </div>
                  <Badge
                    className={
                      task.status === "DONE"
                        ? "bg-green-100 text-green-700"
                        : task.status === "IN_PROGRESS"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-700"
                    }
                  >
                    {task.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
