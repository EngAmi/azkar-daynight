import { Minus, Plus } from "lucide-react";
import { useFontScale } from "@/hooks/useFontScale";

export function FontSizeControl() {
  const { scale, increase, decrease, reset, canIncrease, canDecrease } = useFontScale();
  const percent = Math.round(scale * 100);

  return (
    <div
      className="flex items-center gap-0.5 rounded-full bg-secondary/40 border border-border/40 backdrop-blur-sm px-1 py-1 touch-manipulation"
      role="group"
      aria-label="حجم الخط"
      onPointerDownCapture={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={decrease}
        disabled={!canDecrease}
        aria-label="تصغير الخط"
        title="تصغير الخط"
        className="w-9 h-9 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary active:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors touch-manipulation"
      >
        <Minus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
      </button>
      <button
        type="button"
        onClick={reset}
        aria-label={`حجم الخط الحالي ${percent}٪ — اضغط للإرجاع`}
        title={`${percent}٪`}
        className="font-naskh text-[11px] sm:text-[10px] tabular-nums text-muted-foreground hover:text-primary transition-colors min-w-[34px] sm:min-w-[28px] text-center px-1 py-1 touch-manipulation"
      >
        {percent}٪
      </button>
      <button
        type="button"
        onClick={increase}
        disabled={!canIncrease}
        aria-label="تكبير الخط"
        title="تكبير الخط"
        className="w-9 h-9 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary active:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors touch-manipulation"
      >
        <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
      </button>
    </div>
  );
}
