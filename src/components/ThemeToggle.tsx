import { Sun, Moon, Sparkles } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, preference, toggle, setPreference } = useTheme();
  const isLight = theme === "light";

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={toggle}
        aria-label={isLight ? "تفعيل الوضع الليلي" : "تفعيل الوضع النهاري"}
        title={isLight ? "الوضع الليلي" : "الوضع النهاري"}
        className="relative w-9 h-9 rounded-full flex items-center justify-center bg-secondary/40 border border-border/40 text-muted-foreground hover:text-primary hover:border-primary/40 transition-all duration-300 backdrop-blur-sm"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isLight ? "sun" : "moon"}
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {isLight ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </motion.span>
        </AnimatePresence>
      </button>

      {preference !== "auto" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setPreference("auto");
          }}
          aria-label="الوضع التلقائي حسب الوقت"
          title="تلقائي حسب الوقت"
          className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground/40 hover:text-primary/70 transition-colors"
        >
          <Sparkles className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
