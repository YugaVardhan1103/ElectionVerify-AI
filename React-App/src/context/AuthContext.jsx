import { useState, useEffect, useMemo, useCallback } from "react";
import { AuthContext } from "./AuthContext.js";
import {
  login as apiLogin,
  signup as apiSignup,
  logout as apiLogout,
  getMe,
} from "../services/authService.js";

/**
 * ElectionVerify AI - Authentication Provider Component
 *
 * Exposes reactive authentication state and methods backed by the
 * Shared-Backend JWT authentication API, with seamless offline demo fallback.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  // Initialize and verify session on initial mount
  useEffect(() => {
    let isMounted = true;
    async function initAuth() {
      try {
        const currentUser = await getMe();
        if (isMounted && currentUser) {
          setUser(currentUser);
          setIsDemo(Boolean(currentUser.isDemoUser));
        }
      } catch (err) {
        console.warn("Auth initialization failed:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async ({ email, password } = {}) => {
    setIsLoading(true);
    const result = await apiLogin({ email, password });
    setIsLoading(false);
    if (result.success && result.user) {
      setUser(result.user);
      setIsDemo(Boolean(result.isDemo));
    }
    return result;
  }, []);

  const signup = useCallback(
    async ({ name, email, password, confirmPassword, agreedToTerms } = {}) => {
      setIsLoading(true);
      const result = await apiSignup({
        name,
        email,
        password,
        confirmPassword,
        agreedToTerms,
      });
      setIsLoading(false);
      if (result.success && result.user) {
        setUser(result.user);
        setIsDemo(Boolean(result.isDemo));
      }
      return result;
    },
    []
  );

  const logout = useCallback(async () => {
    const result = await apiLogout();
    setUser(null);
    setIsDemo(false);
    return result;
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(user),
      user,
      isLoading,
      isDemo,
      login,
      signup,
      logout,
    }),
    [user, isLoading, isDemo, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
