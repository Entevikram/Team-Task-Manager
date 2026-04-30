import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/services/http";
import { Users, Lock, Mail } from "lucide-react";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginAs, setLoginAs] = useState<"ADMIN" | "MEMBER">("MEMBER");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !email.includes("@")) return setError("Enter a valid email.");
    if (!password || password.length < 6) return setError("Password must be at least 6 characters.");

    try {
      setLoading(true);
      await login(email, password, loginAs);
      navigate(from, { replace: true });
    } catch (err) {
      const message = getApiErrorMessage(err, "Unable to login.");
      setError(message);
      console.error("Login failed:", err as AxiosError<{ error: string }>);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6">
      <Card className="w-full max-w-md border-0 bg-white/95 shadow-2xl backdrop-blur">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-1 text-2xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-sm text-slate-500">Sign in to your workspace</p>
        </div>
        <div className="mb-6 flex justify-center rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setLoginAs("MEMBER")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              loginAs === "MEMBER" ? "bg-white shadow text-blue-600" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Member
          </button>
          <button
            type="button"
            onClick={() => setLoginAs("ADMIN")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              loginAs === "ADMIN" ? "bg-white shadow text-blue-600" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Admin
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input className="pl-10" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-10"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? <Spinner /> : "Sign In"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-700">
            Create account
          </Link>
        </p>
      </Card>
    </div>
  );
}
