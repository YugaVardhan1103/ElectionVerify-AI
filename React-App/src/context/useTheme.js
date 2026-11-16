import { useContext } from "react";
import ThemeContext from "./ThemeContext.js";

/**
 * Hook to access the current theme context.
 *
 * @returns {{
 *   theme: "Light" | "Dark" | "System",
 *   setTheme: (theme: string) => void,
 *   resolvedTheme: "Light" | "Dark",
 *   toggleTheme: () => void
 * }}
 */
export function useTheme() {
  return useContext(ThemeContext);
}

export default useTheme;
