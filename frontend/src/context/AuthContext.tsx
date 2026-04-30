import { createContext, useEffect, useMemo, useState } from "react";
import { authApi } from "@/services/api";
import { TOKEN_KEY } from "@/services/http";
import type { User } from "@/types";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string, role?: "ADMIN" | "MEMBER") => Promise<void>;
  signup: (input: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string, role?: "ADMIN" | "MEMBER") => {
    const res = await authApi.login({ email, password, role });
    localStorage.setItem(TOKEN_KEY, res.data.token);
    setUser(res.data.user);
  };

  const signup = async (input: { name: string; email: string; password: string }) => {
    await authApi.signup({ ...input, role: "MEMBER" });
  };

  const logout = async () => {
    await authApi.logout().catch(() => null);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, isLoggedIn: Boolean(user), login, signup, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
