import { useEffect, useState } from "react";
import ThemeContext from "./ThemeContext";

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("themePreference") || "Light"
  );

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      theme === "Dark"
    );

    localStorage.setItem("themePreference", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}