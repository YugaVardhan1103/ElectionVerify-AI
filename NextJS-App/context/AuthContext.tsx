"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { UserProfile } from "@/types";
import { authApi } from "@/lib/api";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  socialLogin: (param?: string | { provider?: string; email?: string; name?: string; avatarUrl?: string }) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void> | void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const currentUser = await authApi.getMe();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (err) {
        console.warn("Auth initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    const res = await authApi.login(credentials);
    setIsLoading(false);
    if (res.success && res.user) {
      setUser(res.user);
      return { success: true };
    }
    return { success: false, error: res.error || "Login failed" };
  }, []);

  const socialLogin = useCallback(
    async (param?: string | { provider?: string; email?: string; name?: string; avatarUrl?: string }) => {
      setIsLoading(true);
      const res = await authApi.socialLogin(param);
      setIsLoading(false);
      if (res.success && res.user) {
        setUser(res.user);
        return { success: true };
      }
      return { success: false, error: res.error || "Social login failed" };
    },
    []
  );

  const register = useCallback(async (data: { name: string; email: string; password: string }) => {
    setIsLoading(true);
    const res = await authApi.register(data);
    setIsLoading(false);
    if (res.success) {
      return { success: true };
    }
    return { success: false, error: res.error || "Registration failed" };
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      socialLogin,
      register,
      logout,
    }),
    [user, isLoading, login, socialLogin, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
