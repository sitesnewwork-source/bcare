// Dark mode removed — site is always in light mode.
// Stub kept to avoid breaking any lingering imports.
import { useEffect } from "react";

export const useTheme = () => {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    try {
      localStorage.removeItem("site_theme");
      localStorage.removeItem("admin_theme");
    } catch {}
  }, []);
  return { theme: "light" as const, toggleTheme: () => {} };
};
