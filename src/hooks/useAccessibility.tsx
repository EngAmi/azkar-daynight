import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const STORAGE_KEY = "azkar-a11y-mode";

interface AccessibilityContextValue {
  a11yMode: boolean;
  toggle: () => void;
  setA11yMode: (v: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [a11yMode, setA11yMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "1";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, a11yMode ? "1" : "0");
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("a11y-mode", a11yMode);
    }
  }, [a11yMode]);

  const toggle = useCallback(() => setA11yMode((v) => !v), []);

  return (
    <AccessibilityContext.Provider value={{ a11yMode, toggle, setA11yMode }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
}
