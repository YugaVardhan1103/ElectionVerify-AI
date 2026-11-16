import { useEffect, useState, useMemo, useCallback } from "react";
import ThemeContext, { normalizeTheme } from "./ThemeContext.js";

/**
 * ElectionVerify AI - Theme Provider Component
 *
 * Supports:
 * - "Light", "Dark", and "System" theme preferences (strictly validated).
 * - Reactive listener for OS color scheme changes when "System" is selected.
 * - Automatic synchronization with document.documentElement (.dark class) and localStorage.
 * - Same storage key ("themePreference") as the pre-hydration script in index.html.
 * - Exposes: theme, setTheme, resolvedTheme, toggleTheme.
 */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem("themePreference");
      return normalizeTheme(stored);
    } catch {
      return "System";
    }
  });

  const [systemIsDark, setSystemIsDark] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Listen to OS system color scheme changes dynamically
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      setSystemIsDark(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Compute resolved active theme ("Light" or "Dark")
  // System theme dynamically reflects the OS preference
  const resolvedTheme = useMemo(() => {
    if (theme === "Dark") return "Dark";
    if (theme === "Light") return "Light";
    return systemIsDark ? "Dark" : "Light";
  }, [theme, systemIsDark]);

  // Synchronize documentElement class and localStorage
  useEffect(() => {
    const isDark = resolvedTheme === "Dark";
    document.documentElement.classList.toggle("dark", isDark);

    try {
      localStorage.setItem("themePreference", theme);
    } catch {
      // Ignore localStorage errors (e.g. private browsing restrictions)
    }
  }, [theme, resolvedTheme]);

  // Validates theme values so only Light, Dark, or System are accepted
  const setTheme = useCallback((newTheme) => {
    setThemeState((prevTheme) => {
      const candidate =
        typeof newTheme === "function" ? newTheme(prevTheme) : newTheme;
      return normalizeTheme(candidate);
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(() => (resolvedTheme === "Dark" ? "Light" : "Dark"));
  }, [resolvedTheme]);

  const contextValue = useMemo(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
