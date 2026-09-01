import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const STORAGE_KEY = "azkar-a11y-mode";

interface AccessibilityContextValue {
  a11yMode: boolean;
  toggle: () => void;
  setA11yMode: (v: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [a11yMode, setA11yMode] = useState<boolean>(false);

  // مزامنة الحالة مع ما طبّقه سكربت الرأس (يمنع الومضة واختلاف الـhydration)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "1" || document.documentElement.classList.contains("a11y-mode")) {
      setA11yMode(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, a11yMode ? "1" : "0");
    const root = document.documentElement;
    root.classList.toggle("a11y-mode", a11yMode);
    root.setAttribute("data-a11y", a11yMode ? "on" : "off");
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
