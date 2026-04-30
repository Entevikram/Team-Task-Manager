import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/useAuth";
import { projectsApi } from "@/services/api";
import type { Member, Project } from "@/types";

export function TeamMembersPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUserId, setNewUserId] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [error, setError] = useState("");

  useEffect(() => {
    projectsApi
      .list()
      .then((res) => {
        setProjects(res.data.projects);
        setProjectId(res.data.projects[0]?.id || "");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!projectId) return;
    projectsApi
      .members(projectId)
      .then((res) => setMembers(res.data.members))
      .catch(() => setError("Failed to load members."));
  }, [projectId]);

  const addMember = async () => {
    if (!newUserId || !projectId) return;
    try {
      await projectsApi.addMember(projectId, { userId: newUserId, role });
      setNewUserId("");
      const refreshed = await projectsApi.members(projectId);
      setMembers(refreshed.data.members);
    } catch {
      setError("Unable to add member.");
    }
  };

  const removeMember = async (userId: string) => {
    if (!projectId) return;
    try {
      await projectsApi.removeMember(projectId, userId);
      const refreshed = await projectsApi.members(projectId);
      setMembers(refreshed.data.members);
    } catch {
      setError("Unable to remove member.");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Team Members</h2>
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
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <Input
              placeholder="User ID to add"
              value={newUserId}
              onChange={(e) => setNewUserId(e.target.value)}
            />
            <select
              className="h-10 rounded-md border px-3 text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value as "ADMIN" | "MEMBER")}
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
            <Button onClick={addMember}>Add Member</Button>
          </div>
        )}
      </Card>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="space-y-2">
        {members.map((member) => (
          <Card key={member.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{member.user.name}</p>
              <p className="text-xs text-slate-500">{member.user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium">{member.role}</p>
              {user?.role === "ADMIN" && (
                <Button variant="destructive" size="sm" onClick={() => removeMember(member.user.id)}>
                  Remove
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
