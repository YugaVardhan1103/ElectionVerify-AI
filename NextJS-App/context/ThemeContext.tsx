"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";

type Theme = "Light" | "Dark" | "System";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "Light" | "Dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("System");
  const [resolvedTheme, setResolvedTheme] = useState<"Light" | "Dark">("Light");

  useEffect(() => {
    const saved = localStorage.getItem("themePreference") as Theme | null;
    if (saved && ["Light", "Dark", "System"].includes(saved)) {
      setThemeState(saved);
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      let active: "Light" | "Dark" = "Light";
      if (theme === "Dark") {
        active = "Dark";
      } else if (theme === "Light") {
        active = "Light";
      } else {
        active = mediaQuery.matches ? "Dark" : "Light";
      }

      setResolvedTheme(active);

      if (active === "Dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    applyTheme();

    const handler = () => {
      if (theme === "System") {
        applyTheme();
      }
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("themePreference", newTheme);
  };

  const toggleTheme = () => {
    const next = resolvedTheme === "Dark" ? "Light" : "Dark";
    setTheme(next);
  };

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
