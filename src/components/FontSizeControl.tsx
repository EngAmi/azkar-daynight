import { Minus, Plus } from "lucide-react";
import { useFontScale } from "@/hooks/useFontScale";

export function FontSizeControl() {
  const { scale, increase, decrease, reset, canIncrease, canDecrease } = useFontScale();
  const percent = Math.round(scale * 100);

  return (
    <div
      className="flex items-center gap-0.5 rounded-full bg-secondary/40 border border-border/40 backdrop-blur-sm px-1 py-1"
      role="group"
      aria-label="حجم الخط"
    >
      <button
        onClick={decrease}
        disabled={!canDecrease}
        aria-label="تصغير الخط"
        title="تصغير الخط"
        className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={reset}
        aria-label={`حجم الخط الحالي ${percent}٪ — اضغط للإرجاع`}
        title={`${percent}٪`}
        className="font-naskh text-[10px] tabular-nums text-muted-foreground hover:text-primary transition-colors min-w-[28px] text-center"
      >
        {percent}٪
      </button>
      <button
        onClick={increase}
        disabled={!canIncrease}
        aria-label="تكبير الخط"
        title="تكبير الخط"
        className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
