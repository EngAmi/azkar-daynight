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

  const handleTap = useCallback(() => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(autoCycle ? 30 : 50);
    }
    // Ripple effect
    setRipples((prev) => [...prev, rippleIdRef.current++]);
    onComplete();
  }, [onComplete, autoCycle]);

  // Clean up old ripples
  useEffect(() => {
    if (ripples.length > 3) {
      const timer = setTimeout(() => {
        setRipples((prev) => prev.slice(-3));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [ripples]);

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

      {/* Touch target */}
      <motion.button
        onClick={handleTap}
        whileTap={{ scale: 0.92 }}
        className="relative z-10 rounded-full flex flex-col items-center justify-center cursor-pointer glass-surface border border-primary/20"
        style={{ width: size, height: size }}
        aria-label="سبّح"
      >
        {totalReps > 1 && (
          <motion.span
            key={currentRep}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-primary font-amiri text-2xl leading-none"
          >
            {totalReps - currentRep}
          </motion.span>
        )}
        <span className={`text-primary/60 font-naskh ${totalReps > 1 ? 'text-[11px] mt-1' : 'text-base'}`}>سبّح</span>
      </motion.button>
    </div>
  );
}
