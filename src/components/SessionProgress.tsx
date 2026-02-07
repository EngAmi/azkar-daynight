import { motion } from "framer-motion";

interface SessionProgressProps {
  current: number;
  total: number;
  /** Current rep within this dhikr */
  currentRep: number;
  /** Total reps for this dhikr */
  totalReps: number;
}

export function SessionProgress({ current, total, currentRep, totalReps }: SessionProgressProps) {
  const overallProgress = ((current - 1) / total) * 100 + (currentRep / totalReps / total) * 100;

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* Minimal progress bar */}
      <div className="w-full max-w-xs h-[2px] bg-border/30 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary/50 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${overallProgress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Subtle rep dots for current dhikr (only if more than 1 rep) */}
      {totalReps > 1 && (
        <div className="flex items-center gap-1.5" dir="ltr">
          {Array.from({ length: Math.min(totalReps, 10) }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0.2 }}
              animate={{
                scale: i < currentRep ? 1 : 0.8,
                opacity: i < currentRep ? 1 : 0.2,
                backgroundColor:
                  i < currentRep
                    ? "hsl(var(--primary))"
                    : "hsl(var(--muted-foreground))",
              }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
              className="w-1.5 h-1.5 rounded-full"
            />
          ))}
          {totalReps > 10 && (
            <span className="text-[10px] text-muted-foreground/50 font-naskh mr-1">
              {currentRep}/{totalReps}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
