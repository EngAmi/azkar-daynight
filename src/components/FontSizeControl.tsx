import { Minus, Plus, RotateCcw } from "lucide-react";
import { useFontScale } from "@/hooks/useFontScale";

const tap = (fn: () => void) => () => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try { navigator.vibrate(12); } catch {}
  }
  fn();
};

export function FontSizeControl() {
  const { scale, increase, decrease, reset, canIncrease, canDecrease } = useFontScale();
  const percent = Math.round(scale * 100);

  return (
    <div
      className="flex items-center gap-1 rounded-full bg-secondary/60 border border-gold/25 backdrop-blur-md px-1.5 py-1.5 shadow-inner shadow-black/5 touch-manipulation relative z-20"
      role="group"
      aria-label="حجم الخط"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerDownCapture={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={tap(decrease)}
        disabled={!canDecrease}
        aria-label="تصغير الخط"
        title="تصغير الخط"
        className="w-11 h-11 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-surface/80 text-gold/90 border border-gold/15 shadow-sm hover:bg-gold/10 hover:text-gold hover:border-gold/40 hover:shadow-gold/20 hover:shadow-lg active:scale-90 active:bg-gold/20 active:text-gold disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gold/15 disabled:hover:shadow-none transition-all duration-200 touch-manipulation"
      >
        <Minus className="w-5 h-5 sm:w-4 sm:h-4 stroke-[2.5]" />
      </button>

      <button
        type="button"
        onClick={tap(reset)}
        aria-label={`حجم الخط الحالي ${percent}٪ — اضغط للإرجاع للقيمة الافتراضية`}
        title={`${percent}٪ — اضغط للإرجاع`}
        className="group relative flex flex-col items-center justify-center min-w-[52px] sm:min-w-[44px] h-11 sm:h-9 px-2 rounded-full font-naskh text-sm sm:text-xs tabular-nums text-foreground/90 hover:text-gold active:scale-95 active:text-gold transition-all duration-200 touch-manipulation"
      >
        <span className="leading-none">{percent}٪</span>
        <RotateCcw className="absolute opacity-0 group-hover:opacity-60 group-active:opacity-80 -translate-y-1 group-hover:translate-y-3 sm:group-hover:translate-y-2.5 transition-all duration-200 w-3 h-3 sm:w-2.5 sm:h-2.5 text-gold" />
      </button>

      <button
        type="button"
        onClick={tap(increase)}
        disabled={!canIncrease}
        aria-label="تكبير الخط"
        title="تكبير الخط"
        className="w-11 h-11 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-surface/80 text-gold/90 border border-gold/15 shadow-sm hover:bg-gold/10 hover:text-gold hover:border-gold/40 hover:shadow-gold/20 hover:shadow-lg active:scale-90 active:bg-gold/20 active:text-gold disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gold/15 disabled:hover:shadow-none transition-all duration-200 touch-manipulation"
      >
        <Plus className="w-5 h-5 sm:w-4 sm:h-4 stroke-[2.5]" />
      </button>
    </div>
  );
}
