"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Theme = "light" | "dark";

type Ctx = {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
};

const ThemeCtx = createContext<Ctx>({
  theme: "light",
  toggle: () => {},
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeCtx);
}

const STORAGE_KEY = "arengcon-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? null;
    const initial: Theme =
      saved ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    setThemeState(initial);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem(STORAGE_KEY, theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0a0a0a" : "#ffffff");
  }, [theme]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggle = useCallback(
    () => setThemeState((t) => (t === "dark" ? "light" : "dark")),
    [],
  );

  return (
    <ThemeCtx.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeCtx.Provider>
  );
}
