import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const STORAGE_KEY = "azkar-font-scale";
const SCALES = [0.85, 1, 1.15, 1.3, 1.5] as const;
export type FontScale = (typeof SCALES)[number];

interface FontScaleContextValue {
  scale: FontScale;
  scales: readonly FontScale[];
  increase: () => void;
  decrease: () => void;
  reset: () => void;
  canIncrease: boolean;
  canDecrease: boolean;
}

const FontScaleContext = createContext<FontScaleContextValue | undefined>(undefined);

export function FontScaleProvider({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState<FontScale>(() => {
    if (typeof window === "undefined") return 1;
    const stored = parseFloat(localStorage.getItem(STORAGE_KEY) ?? "");
    return (SCALES as readonly number[]).includes(stored) ? (stored as FontScale) : 1;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(scale));
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--font-scale", String(scale));
    }
  }, [scale]);

  const idx = SCALES.indexOf(scale);

  const increase = useCallback(() => {
    setScale((s) => {
      const i = SCALES.indexOf(s);
      return SCALES[Math.min(i + 1, SCALES.length - 1)];
    });
  }, []);

  const decrease = useCallback(() => {
    setScale((s) => {
      const i = SCALES.indexOf(s);
      return SCALES[Math.max(i - 1, 0)];
    });
  }, []);

  const reset = useCallback(() => setScale(1), []);

  return (
    <FontScaleContext.Provider
      value={{
        scale,
        scales: SCALES,
        increase,
        decrease,
        reset,
        canIncrease: idx < SCALES.length - 1,
        canDecrease: idx > 0,
      }}
    >
      {children}
    </FontScaleContext.Provider>
  );
}

export function useFontScale() {
  const ctx = useContext(FontScaleContext);
  if (!ctx) throw new Error("useFontScale must be used within FontScaleProvider");
  return ctx;
}
