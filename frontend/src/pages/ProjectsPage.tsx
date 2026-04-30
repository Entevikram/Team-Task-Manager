import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/useAuth";
import { projectsApi } from "@/services/api";
import type { Project } from "@/types";

export function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDetails, setSelectedDetails] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await projectsApi.list();
      setProjects(res.data.projects);
    } catch {
      setError("Unable to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProjects();
  }, []);

  const createProject = async () => {
    if (!name.trim()) return;
    try {
      await projectsApi.create({ name, description });
      setName("");
      setDescription("");
      await loadProjects();
    } catch (err) {
      const message = (err as AxiosError<{ error: string }>).response?.data?.error;
      setError(message || "Failed to create project.");
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      await projectsApi.remove(projectId);
      await loadProjects();
      if (selectedDetails?.id === projectId) setSelectedDetails(null);
    } catch {
      setError("Failed to delete project.");
    }
  };

  const viewDetails = async (projectId: string) => {
    try {
      const res = await projectsApi.details(projectId);
      setSelectedDetails(res.data.project);
    } catch {
      setError("Unable to fetch project details.");
    }
  };

  const startEdit = (project: Project) => {
    setEditingProject(project);
    setEditName(project.name);
    setEditDescription(project.description || "");
  };

  const saveEdit = async () => {
    if (!editingProject || !editName.trim()) return;
    try {
      await projectsApi.update(editingProject.id, { name: editName, description: editDescription });
      setEditingProject(null);
      await loadProjects();
      if (selectedDetails?.id === editingProject.id) {
        const res = await projectsApi.details(editingProject.id);
        setSelectedDetails(res.data.project);
      }
    } catch (err) {
      const message = (err as AxiosError<{ error: string }>).response?.data?.error;
      setError(message || "Failed to update project.");
    }
  };

  const cancelEdit = () => {
    setEditingProject(null);
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Projects</h2>
      </div>
      {user?.role === "ADMIN" && (
        <Card className="space-y-3">
          <h3 className="font-medium">Create Project</h3>
          <Input placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button onClick={createProject}>Create</Button>
        </Card>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {projects.length === 0 ? (
        <EmptyState title="No projects" description="Create your first project to start assigning tasks." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {projects.map((project) => (
            <Card key={project.id}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold">{project.name}</h3>
                <Badge>{project._count?.tasks || 0} tasks</Badge>
              </div>
              <p className="text-sm text-slate-500">{project.description || "No description added."}</p>
              <p className="mt-3 text-xs text-slate-400">Members: {project._count?.members || 0}</p>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => viewDetails(project.id)}>
                  View details
                </Button>
                {user?.role === "ADMIN" && (
                  <>
                    <Button variant="secondary" size="sm" onClick={() => startEdit(project)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteProject(project.id)}>
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      {selectedDetails && (
        <Card>
          <h3 className="mb-2 text-lg font-semibold">Project details</h3>
          <p className="text-sm">Name: {selectedDetails.name}</p>
          <p className="text-sm text-slate-500">
            Description: {selectedDetails.description || "No description"}
          </p>
        </Card>
      )}
      {editingProject && (
        <Card>
          <h3 className="mb-2 text-lg font-semibold">Edit Project</h3>
          <div className="space-y-3">
            <Input
              placeholder="Project name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <Input
              placeholder="Description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={saveEdit}>Save</Button>
              <Button variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
