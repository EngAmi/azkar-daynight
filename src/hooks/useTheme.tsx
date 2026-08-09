import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

export type ThemeMode = "light" | "dark";
export type ThemePreference = ThemeMode | "auto" | "system";

interface ThemeContextValue {
  theme: ThemeMode;
  preference: ThemePreference;
  systemSync: boolean;
  setPreference: (pref: ThemePreference) => void;
  toggleSystemSync: () => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const STORAGE_KEY = "azkar-theme-preference";
const MANUAL_KEY = "azkar-theme-manual";

function getAutoTheme(): ThemeMode {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? "light" : "dark";
}

function getSystemTheme(): ThemeMode {
  if (typeof window === "undefined" || !window.matchMedia) return getAutoTheme();
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(pref: ThemePreference): ThemeMode {
  if (pref === "light" || pref === "dark") return pref;
  if (pref === "system") return getSystemTheme();
  return getAutoTheme();
}

function applyThemeClass(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "light") {
    root.classList.add("light");
    root.classList.remove("dark");
  } else {
    root.classList.add("dark");
    root.classList.remove("light");
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    // اقرأ قيمة --background (HSL خام) من الثيمة الفعّالة بدل استخدام ألوان ثابتة
    const bg = getComputedStyle(root).getPropertyValue("--background").trim();
    if (bg) meta.setAttribute("content", `hsl(${bg})`);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    if (typeof window === "undefined") return "auto";
    const stored = localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
    return stored ?? "auto";
  });

  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "dark";
    const stored = localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
    if (stored === "light" || stored === "dark") return stored;
    if (document.documentElement.classList.contains("light")) return "light";
    if (document.documentElement.classList.contains("dark")) return "dark";
    return resolveTheme(stored ?? "auto");
  });

  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  // مزامنة تلقائية مع ثيم النظام
  useEffect(() => {
    if (preference !== "system" || typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setTheme(mq.matches ? "dark" : "light");
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [preference]);

  useEffect(() => {
    if (preference !== "auto") return;
    const tick = () => {
      const next = getAutoTheme();
      setTheme((prev) => (prev !== next ? next : prev));
    };
    tick();
    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, [preference]);

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    localStorage.setItem(STORAGE_KEY, pref);
    if (pref === "light" || pref === "dark") {
      // احفظ اختيار المستخدم اليدوي لاسترجاعه عند تعطيل المزامنة
      localStorage.setItem(MANUAL_KEY, pref);
    }
    setTheme(resolveTheme(pref));
  }, []);

  const toggleSystemSync = useCallback(() => {
    setPreferenceState((prev) => {
      if (prev === "system") {
        const manual = localStorage.getItem(MANUAL_KEY) as ThemeMode | null;
        const next: ThemePreference = manual === "light" || manual === "dark" ? manual : "auto";
        localStorage.setItem(STORAGE_KEY, next);
        setTheme(resolveTheme(next));
        return next;
      }
      localStorage.setItem(STORAGE_KEY, "system");
      setTheme(getSystemTheme());
      return "system";
    });
  }, []);

  const toggle = useCallback(() => {
    setPreference(theme === "light" ? "dark" : "light");
  }, [theme, setPreference]);

  return (
    <ThemeContext.Provider
      value={{ theme, preference, systemSync: preference === "system", setPreference, toggleSystemSync, toggle }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
