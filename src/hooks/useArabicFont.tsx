import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export const STORAGE_KEY = "azkar-arabic-font";
export const SPACING_STORAGE_KEY = "azkar-arabic-spacing";

export type ArabicFontId = "amiri" | "naskh" | "scheherazade" | "tajawal";
export type SpacingId = "compact" | "cozy" | "relaxed";

export interface ArabicFontOption {
  id: ArabicFontId;
  label: string;
  hint: string;
  stack: string;
  /** معامل تصحيح بصري لحجم الخط */
  adjust: number;
  /** معامل تصحيح لتباعد الأسطر */
  leading: number;
  /** تباعد الكلمات المناسب لهذا الخط (em) */
  word: number;
  /** تباعد الحروف المناسب لهذا الخط (em) */
  letter: number;
  /** الهوامش الرأسية بين الفقرات (rem) */
  block: number;
  /** كثافة التباعد الافتراضية لهذا الخط */
  spacing: SpacingId;
}

export const ARABIC_FONTS: readonly ArabicFontOption[] = [
  {
    id: "amiri",
    label: "أميري",
    hint: "نسخ كلاسيكي متوازن",
    stack: "'Amiri', 'Amiri Fallback', serif",
    adjust: 1,
    leading: 1,
    word: 0.04,
    letter: 0.025,
    block: 1.15,
    spacing: "cozy",
  },
  {
    id: "naskh",
    label: "نسخ",
    hint: "أوضح للقراءة الطويلة",
    stack: "'Noto Naskh Arabic', 'Amiri', serif",
    adjust: 0.94,
    leading: 1.04,
    word: 0.02,
    letter: 0.01,
    block: 1.25,
    spacing: "relaxed",
  },
  {
    id: "scheherazade",
    label: "شهرزاد",
    hint: "حروف كبيرة ومريحة",
    stack: "'Scheherazade New', 'Amiri', serif",
    adjust: 1.06,
    leading: 1.06,
    word: 0.06,
    letter: 0,
    block: 1.35,
    spacing: "relaxed",
  },
  {
    id: "tajawal",
    label: "تجوّل",
    hint: "عصري بلا زخرفة",
    stack: "'Tajawal', 'Noto Naskh Arabic', sans-serif",
    adjust: 0.92,
    leading: 1.06,
    word: 0.01,
    letter: 0,
    block: 1.1,
    spacing: "cozy",
  },
] as const;

export interface SpacingOption {
  id: SpacingId;
  label: string;
  hint: string;
  /** مضاعف تباعد الأسطر */
  leading: number;
  /** مضاعف تباعد الكلمات/الحروف */
  tracking: number;
  /** مضاعف الهوامش */
  block: number;
}

export const SPACING_LEVELS: readonly SpacingOption[] = [
  { id: "compact", label: "مضغوط", hint: "أسطر أقرب — نصّ أكثر في الشاشة", leading: 0.9, tracking: 0.7, block: 0.8 },
  { id: "cozy", label: "متوازن", hint: "التباعد الافتراضي للخط", leading: 1, tracking: 1, block: 1 },
  { id: "relaxed", label: "مريح", hint: "أسطر وهوامش أوسع للقراءة الطويلة", leading: 1.14, tracking: 1.4, block: 1.3 },
] as const;

const isValid = (v: string | null): v is ArabicFontId =>
  !!v && ARABIC_FONTS.some((f) => f.id === v);

const isSpacing = (v: unknown): v is SpacingId =>
  typeof v === "string" && SPACING_LEVELS.some((s) => s.id === v);

export function getArabicFont(id: ArabicFontId): ArabicFontOption {
  return ARABIC_FONTS.find((f) => f.id === id) ?? ARABIC_FONTS[0]!;
}

export function getSpacing(id: SpacingId): SpacingOption {
  return SPACING_LEVELS.find((s) => s.id === id) ?? SPACING_LEVELS[1]!;
}

type SpacingMap = Partial<Record<ArabicFontId, SpacingId>>;

function readSpacingMap(): SpacingMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SPACING_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: SpacingMap = {};
    for (const f of ARABIC_FONTS) {
      const v = parsed[f.id];
      if (isSpacing(v)) out[f.id] = v;
    }
    return out;
  } catch {
    return {};
  }
}

interface ArabicFontContextValue {
  font: ArabicFontId;
  fonts: readonly ArabicFontOption[];
  setFont: (id: ArabicFontId) => void;
  /** كثافة التباعد الفعّالة للخط الحالي */
  spacing: SpacingId;
  spacings: readonly SpacingOption[];
  /** هل التباعد الحالي هو الافتراضي التلقائي للخط */
  isAutoSpacing: boolean;
  setSpacing: (id: SpacingId) => void;
  resetSpacing: () => void;
}

const ArabicFontContext = createContext<ArabicFontContextValue | undefined>(undefined);

function applyFont(id: ArabicFontId, spacingId: SpacingId) {
  if (typeof document === "undefined") return;
  const f = getArabicFont(id);
  const s = getSpacing(spacingId);
  const root = document.documentElement;
  root.style.setProperty("--arabic-font", f.stack);
  root.style.setProperty("--arabic-font-adjust", String(f.adjust));
  root.style.setProperty("--arabic-leading-adjust", String(+(f.leading * s.leading).toFixed(3)));
  root.style.setProperty("--arabic-word-spacing", `${+(f.word * s.tracking).toFixed(4)}em`);
  root.style.setProperty("--arabic-letter-spacing", `${+(f.letter * s.tracking).toFixed(4)}em`);
  root.style.setProperty("--arabic-block-gap", `${+(f.block * s.block).toFixed(3)}rem`);
  root.setAttribute("data-arabic-font", f.id);
  root.setAttribute("data-arabic-spacing", s.id);
}

export function ArabicFontProvider({ children }: { children: ReactNode }) {
  const [font, setFontState] = useState<ArabicFontId>(() => {
    if (typeof window === "undefined") return "amiri";
    const stored = localStorage.getItem(STORAGE_KEY);
    return isValid(stored) ? stored : "amiri";
  });

  const [spacingMap, setSpacingMap] = useState<SpacingMap>(() => readSpacingMap());

  const spacing: SpacingId = spacingMap[font] ?? getArabicFont(font).spacing;
  const isAutoSpacing = spacingMap[font] === undefined;

  useEffect(() => {
    applyFont(font, spacing);
    try {
      localStorage.setItem(STORAGE_KEY, font);
    } catch {}
  }, [font, spacing]);

  useEffect(() => {
    try {
      localStorage.setItem(SPACING_STORAGE_KEY, JSON.stringify(spacingMap));
    } catch {}
  }, [spacingMap]);

  const setFont = useCallback((id: ArabicFontId) => setFontState(id), []);

  const setSpacing = useCallback(
    (id: SpacingId) => setSpacingMap((m) => ({ ...m, [font]: id })),
    [font],
  );

  const resetSpacing = useCallback(
    () =>
      setSpacingMap((m) => {
        const next = { ...m };
        delete next[font];
        return next;
      }),
    [font],
  );

  return (
    <ArabicFontContext.Provider
      value={{ font, fonts: ARABIC_FONTS, setFont, spacing, spacings: SPACING_LEVELS, isAutoSpacing, setSpacing, resetSpacing }}
    >
      {children}
    </ArabicFontContext.Provider>
  );
}

export function useArabicFont() {
  const ctx = useContext(ArabicFontContext);
  if (!ctx) throw new Error("useArabicFont must be used within ArabicFontProvider");
  return ctx;
}
