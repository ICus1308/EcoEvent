"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  fullname: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  loginToken: (token: string, userData: AuthUser, rememberMe?: boolean) => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginToken: () => {},
  logout: async () => {},
  checkSession: async () => {}
});

const PROTECTED_ROUTES = ["/dashboard", "/messages"];
const AUTH_ROUTES = ["/login", "/register"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkSession = async () => {
    try {
      const token = typeof window !== "undefined" ? (localStorage.getItem("sessionToken") || sessionStorage.getItem("sessionToken")) : null;
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const res = await fetch("/api/auth/session", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const contentType = res.headers.get("content-type");
      if (res.ok && contentType && contentType.includes("application/json")) {
        const data = await res.json().catch(() => null);
        if (data && data.user) {
          setUser(data.user);
          setLoading(false);
          return;
        }
      }

      // Token expired, invalid or non-JSON response
      localStorage.removeItem("sessionToken");
      sessionStorage.removeItem("sessionToken");
      setUser(null);
    } catch (error) {
      console.error("Failed to check auth session:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  // Route Guard / Protection logic
  useEffect(() => {
    if (loading) return;

    const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

    if (isProtectedRoute && !user) {
      router.push("/login");
    } else if (isAuthRoute && user) {
      router.push("/");
    }
  }, [user, loading, pathname, router]);

  const loginToken = (token: string, userData: AuthUser, rememberMe: boolean = true) => {
    if (rememberMe) {
      localStorage.setItem("sessionToken", token);
      sessionStorage.removeItem("sessionToken");
      document.cookie = `sessionToken=${token}; path=/; max-age=${30 * 24 * 60 * 60}`;
    } else {
      sessionStorage.setItem("sessionToken", token);
      localStorage.removeItem("sessionToken");
      document.cookie = `sessionToken=${token}; path=/`; // Session cookie
    }
    setUser(userData);
    router.push("/");
  };

  const logout = async () => {
    const token = localStorage.getItem("sessionToken") || sessionStorage.getItem("sessionToken");
    if (token) {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).catch(() => {});
    }
    localStorage.removeItem("sessionToken");
    sessionStorage.removeItem("sessionToken");
    document.cookie = "sessionToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginToken, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
