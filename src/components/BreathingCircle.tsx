import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BreathingCircleProps {
  /** Called when one rep is completed */
  onComplete: () => void;
  /** Whether auto-cycling (for high-count adhkar) */
  autoCycle?: boolean;
  /** Size of the circle */
  size?: number;
  /** Current repetition (0-indexed) */
  currentRep?: number;
  /** Total repetitions needed */
  totalReps?: number;
}

export function BreathingCircle({
  onComplete,
  autoCycle = false,
  size = 200,
  currentRep = 0,
  totalReps = 1,
}: BreathingCircleProps) {
  const [ripples, setRipples] = useState<number[]>([]);
  const rippleIdRef = useRef(0);

  // Smart counter logic
  const remaining = Math.max(totalReps - currentRep, 0);
  const isMulti = totalReps > 1;
  const isLast = isMulti && remaining === 1;
  const progress = isMulti ? Math.min(currentRep / totalReps, 1) : 0;

  const handleTap = useCallback(() => {
    // Smarter haptic: stronger pulse on the final rep, softer on the way
    if (navigator.vibrate) {
      if (isLast) navigator.vibrate([20, 40, 60]);
      else navigator.vibrate(autoCycle ? 25 : 40);
    }
    setRipples((prev) => [...prev, rippleIdRef.current++]);
    onComplete();
  }, [onComplete, autoCycle, isLast]);

  // Clean up old ripples
  useEffect(() => {
    if (ripples.length > 3) {
      const timer = setTimeout(() => {
        setRipples((prev) => prev.slice(-3));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [ripples]);

  // SVG progress ring geometry
  const stroke = 2;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="relative flex items-center justify-center select-none">
      {/* Ripple effects */}
      <AnimatePresence>
        {ripples.map((id) => (
          <motion.div
            key={id}
            initial={{ scale: 0.8, opacity: 0.4 }}
            animate={{ scale: 1.8, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute rounded-full border border-primary/30"
            style={{ width: size, height: size }}
          />
        ))}
      </AnimatePresence>

      {/* Smart progress ring (only when multiple reps) */}
      {isMulti && (
        <svg
          className="absolute -rotate-90"
          width={size}
          height={size}
          aria-hidden="true"
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--primary) / 0.08)"
            strokeWidth={stroke}
          />
          {/* Progress */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--primary) / 0.55)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={false}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </svg>
      )}

      {/* Touch target */}
      <motion.button
        onClick={handleTap}
        whileTap={{ scale: 0.92 }}
        className="relative z-10 rounded-full flex flex-col items-center justify-center cursor-pointer glass-surface border border-primary/20"
        style={{ width: size, height: size }}
        aria-label="سبّح"
      >
        {isMulti && (
          <motion.span
            key={currentRep}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-primary font-amiri text-2xl leading-none"
          >
            {remaining}
          </motion.span>
        )}
        <span className={`text-primary/60 font-naskh ${isMulti ? 'text-[11px] mt-1' : 'text-base'}`}>سبّح</span>
      </motion.button>
    </div>
  );
}
