import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark";

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("admin_theme") as Theme) || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("admin_theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    // Add transition class before toggling
    document.documentElement.classList.add("theme-transitioning");
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
    // Remove after transition completes
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
    }, 500);
  }, []);

  return { theme, toggleTheme };
};
