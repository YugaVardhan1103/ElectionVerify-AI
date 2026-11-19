import { createContext, useContext } from "react";

/**
 * ElectionVerify AI - Authentication Context
 *
 * Provides reactive access to user authentication state.
 */
export const AuthContext = createContext(null);

/**
 * Custom hook to access authentication context.
 *
 * @returns {object} Auth context value { isAuthenticated, user, login, signup, logout }
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
