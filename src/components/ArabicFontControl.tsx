import { useEffect, useRef, useState } from "react";
import { Type, Check } from "lucide-react";
import { useArabicFont } from "@/hooks/useArabicFont";

const haptic = () => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try { navigator.vibrate(12); } catch {}
  }
};

export function ArabicFontControl() {
  const { font, fonts, setFont } = useArabicFont();
  const current = fonts.find((f) => f.id === font) ?? fonts[0]!;
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className="relative z-30 touch-manipulation"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerDownCapture={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        aria-label={`نوع الخط العربي — الحالي ${current.label}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="نوع الخط العربي"
        onClick={() => { haptic(); setOpen((o) => !o); }}
        className={`flex items-center gap-1.5 h-11 sm:h-9 px-3 rounded-full bg-secondary/60 border backdrop-blur-md transition-all duration-200 active:scale-95 ${
          open
            ? "border-gold/50 text-gold bg-gold/10"
            : "border-gold/25 text-gold/90 hover:text-gold hover:border-gold/40 hover:bg-gold/10"
        }`}
      >
        <Type className="w-4 h-4" />
        <span className="text-sm sm:text-xs leading-none" style={{ fontFamily: current.stack }}>
          {current.label}
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="نوع الخط العربي"
          dir="rtl"
          className="absolute top-full mt-2 start-0 w-60 rounded-2xl border border-gold/25 bg-popover/95 backdrop-blur-xl shadow-xl shadow-black/20 p-1.5 z-50"
        >
          {fonts.map((f) => {
            const selected = f.id === font;
            return (
              <button
                key={f.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => { haptic(); setFont(f.id); setOpen(false); }}
                className={`w-full flex items-center justify-between gap-3 text-start px-3 py-2.5 rounded-xl transition-colors ${
                  selected ? "bg-gold/10 text-gold" : "hover:bg-secondary/70 text-foreground/90"
                }`}
              >
                <span className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-base leading-tight" style={{ fontFamily: f.stack }}>
                    {f.label} — بسم الله
                  </span>
                  <span className="font-naskh text-[11px] text-muted-foreground">{f.hint}</span>
                </span>
                {selected && <Check className="w-4 h-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
