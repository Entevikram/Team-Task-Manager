import { BarChart3, Folder, LayoutDashboard, ListChecks, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: Folder },
  { to: "/members", label: "Team Members", icon: Users },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/reports", label: "Reports", icon: BarChart3 },
];

export function Sidebar() {
  return (
    <aside className="w-full border-r bg-white p-4 md:w-64">
      <h2 className="mb-6 text-xl font-bold">Team Task Manager</h2>
      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition hover:bg-slate-100",
                isActive && "bg-blue-50 text-blue-700"
              )
            }
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
