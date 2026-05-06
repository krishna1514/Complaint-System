"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authApi, type User } from "@/lib/api";

interface AuthState {
  user: User | null;
  loading: boolean; // true while hydrating from server
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    department?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (user: User) => void;
}

type AuthContext = AuthState & AuthActions;

const Ctx = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate current user on mount (reads the httpOnly cookie via /api/auth/me)
  const refreshUser = useCallback(async () => {
    const res = await authApi.me();
    if (res.success && res.data?.user) {
      setUser(res.data.user);
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const res = await authApi.me();

        if (!isMounted) return;

        if (res.success && res.data?.user) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    if (res.success && res.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setUser((res.data as any).user);
      return { success: true };
    }
    return { success: false, error: res.error ?? "Login failed" };
  }, []);

  const signup = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      role?: string;
      department?: string;
    }) => {
      const res = await authApi.signup(data);
      if (res.success && res.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setUser((res.data as any).user);
        return { success: true };
      }
      return { success: false, error: res.error ?? "Signup failed" };
    },
    [],
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const updateUser = useCallback((updated: User) => {
    setUser(updated);
  }, []);

  return (
    <Ctx.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// Helper: get initials from name
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
