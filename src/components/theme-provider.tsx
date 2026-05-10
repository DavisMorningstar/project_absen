"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ThemeMode = "light" | "dark";

type ThemeContextType = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme") as ThemeMode | null;
    if (savedTheme === "light" || savedTheme === "dark") {
      setThemeState(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
      return;
    }

    document.documentElement.classList.remove("dark");
  }, []);

  const setTheme = (nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
    localStorage.setItem("app-theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      isDark: theme === "dark",
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
