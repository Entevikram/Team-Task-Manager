import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-4">
      <div>
        <p className="text-sm text-slate-500">Welcome back</p>
        <h1 className="text-lg font-semibold">{user?.name}</h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium">{user?.role}</span>
        <Button
          variant="outline"
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
        >
          Logout
        </Button>
      </div>
    </header>
  );
}
