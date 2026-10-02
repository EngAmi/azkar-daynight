import { useEffect, useState } from "react";
import { ZoomIn } from "lucide-react";

const KEY = "azkar-large-read";

/** خيار للهاتف: الذكر بخط أكبر وتباين أعلى، مع بقاء ملاءمته للشاشة */
export function LargeReadToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(localStorage.getItem(KEY) === "1");
    const onStorage = (e: StorageEvent) => { if (e.key === KEY) setOn(e.newValue === "1"); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("large-read", on);
    try { localStorage.setItem(KEY, on ? "1" : "0"); } catch {}
  }, [on]);

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "إيقاف القراءة المكبّرة" : "تفعيل القراءة المكبّرة بتباين أعلى"}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={() => {
        try { navigator.vibrate?.(12); } catch {}
        setOn((v) => !v);
      }}
      className={`sm:hidden flex items-center gap-1.5 h-11 px-3 rounded-full border backdrop-blur-md transition-all active:scale-95 font-naskh text-sm touch-manipulation ${
        on ? "border-gold/60 text-gold bg-gold/15" : "border-gold/25 text-gold/90 bg-secondary/60"
      }`}
    >
      <ZoomIn className="w-4 h-4" />
      <span>قراءة مكبّرة</span>
    </button>
  );
}
