import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/services/http";

export function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Name is required.");
    if (!form.email.includes("@")) return setError("Enter a valid email.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");

    try {
      setLoading(true);
      await signup(form);
      navigate("/login", { replace: true });
    } catch (err) {
      const message = getApiErrorMessage(err, "Unable to create account.");
      setError(message);
      console.error("Signup failed:", err as AxiosError<{ error: string }>);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <h1 className="mb-1 text-2xl font-bold">Create account</h1>
        <p className="mb-6 text-sm text-slate-500">Join your team workspace</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))}
          />
          <Input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))}
          />
          <Input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((v) => ({ ...v, password: e.target.value }))}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button className="w-full" disabled={loading}>
            {loading ? <Spinner /> : "Sign up"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 underline">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}
