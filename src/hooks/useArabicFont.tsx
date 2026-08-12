import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export const STORAGE_KEY = "azkar-arabic-font";

export type ArabicFontId = "amiri" | "naskh" | "scheherazade" | "tajawal";

export interface ArabicFontOption {
  id: ArabicFontId;
  label: string;
  hint: string;
  stack: string;
  /** معامل تصحيح بصري لحجم الخط */
  adjust: number;
  /** معامل تصحيح لتباعد الأسطر */
  leading: number;
}

export const ARABIC_FONTS: readonly ArabicFontOption[] = [
  {
    id: "amiri",
    label: "أميري",
    hint: "نسخ كلاسيكي متوازن",
    stack: "'Amiri', 'Amiri Fallback', serif",
    adjust: 1,
    leading: 1,
  },
  {
    id: "naskh",
    label: "نسخ",
    hint: "أوضح للقراءة الطويلة",
    stack: "'Noto Naskh Arabic', 'Amiri', serif",
    adjust: 0.94,
    leading: 1.04,
  },
  {
    id: "scheherazade",
    label: "شهرزاد",
    hint: "حروف كبيرة ومريحة",
    stack: "'Scheherazade New', 'Amiri', serif",
    adjust: 1.06,
    leading: 1.06,
  },
  {
    id: "tajawal",
    label: "تجوّل",
    hint: "عصري بلا زخرفة",
    stack: "'Tajawal', 'Noto Naskh Arabic', sans-serif",
    adjust: 0.92,
    leading: 1.06,
  },
] as const;

const isValid = (v: string | null): v is ArabicFontId =>
  !!v && ARABIC_FONTS.some((f) => f.id === v);

export function getArabicFont(id: ArabicFontId): ArabicFontOption {
  return ARABIC_FONTS.find((f) => f.id === id) ?? ARABIC_FONTS[0]!;
}

interface ArabicFontContextValue {
  font: ArabicFontId;
  fonts: readonly ArabicFontOption[];
  setFont: (id: ArabicFontId) => void;
}

const ArabicFontContext = createContext<ArabicFontContextValue | undefined>(undefined);

function applyFont(id: ArabicFontId) {
  if (typeof document === "undefined") return;
  const f = getArabicFont(id);
  const root = document.documentElement;
  root.style.setProperty("--arabic-font", f.stack);
  root.style.setProperty("--arabic-font-adjust", String(f.adjust));
  root.style.setProperty("--arabic-leading-adjust", String(f.leading));
  root.setAttribute("data-arabic-font", f.id);
}

export function ArabicFontProvider({ children }: { children: ReactNode }) {
  const [font, setFontState] = useState<ArabicFontId>(() => {
    if (typeof window === "undefined") return "amiri";
    const stored = localStorage.getItem(STORAGE_KEY);
    return isValid(stored) ? stored : "amiri";
  });

  useEffect(() => {
    applyFont(font);
    try {
      localStorage.setItem(STORAGE_KEY, font);
    } catch {}
  }, [font]);

  const setFont = useCallback((id: ArabicFontId) => setFontState(id), []);

  return (
    <ArabicFontContext.Provider value={{ font, fonts: ARABIC_FONTS, setFont }}>
      {children}
    </ArabicFontContext.Provider>
  );
}

export function useArabicFont() {
  const ctx = useContext(ArabicFontContext);
  if (!ctx) throw new Error("useArabicFont must be used within ArabicFontProvider");
  return ctx;
}
