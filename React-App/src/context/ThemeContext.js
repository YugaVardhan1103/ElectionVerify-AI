import { createContext } from "react";

/**
 * Valid theme values allowed across ElectionVerify AI.
 */
export const VALID_THEMES = Object.freeze(["Light", "Dark", "System"]);

/**
 * Safely validates and normalizes an input theme string.
 *
 * @param {*} val - Candidate theme value
 * @returns {"Light" | "Dark" | "System"} Normalized valid theme
 */
export function normalizeTheme(val) {
  if (typeof val === "string") {
    const formatted =
      val.trim().charAt(0).toUpperCase() + val.trim().slice(1).toLowerCase();
    if (VALID_THEMES.includes(formatted)) {
      return formatted;
    }
  }
  return "System";
}

/**
 * ElectionVerify AI - Theme Context
 *
 * Provides theme state across the application:
 * - theme: "Light" | "Dark" | "System"
 * - resolvedTheme: "Light" | "Dark" (actual active theme)
 * - setTheme: (theme) => void
 * - toggleTheme: () => void
 */
export const ThemeContext = createContext({
  theme: "System",
  setTheme: () => {},
  resolvedTheme: "Light",
  toggleTheme: () => {},
});

export default ThemeContext;
