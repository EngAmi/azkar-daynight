import { Type, Check } from "lucide-react";
import { useArabicFont } from "@/hooks/useArabicFont";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ArabicFontControl() {
  const { font, fonts, setFont } = useArabicFont();
  const current = fonts.find((f) => f.id === font) ?? fonts[0]!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`نوع الخط العربي — الحالي ${current.label}`}
          title="نوع الخط العربي"
          onPointerDownCapture={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 h-11 sm:h-9 px-3 rounded-full bg-secondary/60 border border-gold/25 backdrop-blur-md text-gold/90 hover:text-gold hover:border-gold/40 hover:bg-gold/10 active:scale-95 transition-all duration-200 touch-manipulation relative z-20"
        >
          <Type className="w-4 h-4" />
          <span
            className="text-sm sm:text-xs leading-none"
            style={{ fontFamily: current.stack }}
          >
            {current.label}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-naskh text-xs text-muted-foreground">
          نوع الخط العربي
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {fonts.map((f) => (
          <DropdownMenuItem
            key={f.id}
            onSelect={() => {
              if (typeof navigator !== "undefined" && "vibrate" in navigator) {
                try { navigator.vibrate(12); } catch {}
              }
              setFont(f.id);
            }}
            className="flex items-center justify-between gap-3 cursor-pointer"
          >
            <span className="flex flex-col gap-0.5 min-w-0">
              <span className="text-base leading-tight" style={{ fontFamily: f.stack }}>
                {f.label} — بسم الله
              </span>
              <span className="font-naskh text-[11px] text-muted-foreground">{f.hint}</span>
            </span>
            {f.id === font && <Check className="w-4 h-4 text-gold shrink-0" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
