import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BreathingCircleProps {
  /** Duration in ms for one hold cycle */
  holdDuration?: number;
  /** Called when one rep is completed */
  onComplete: () => void;
  /** Whether auto-cycling (for high-count adhkar) */
  autoCycle?: boolean;
  /** Size of the circle */
  size?: number;
}

export function BreathingCircle({
  holdDuration = 2800,
  onComplete,
  autoCycle = false,
  size = 200,
}: BreathingCircleProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ripples, setRipples] = useState<number[]>([]);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const rippleIdRef = useRef(0);

  const circumference = 2 * Math.PI * (size / 2 - 8);

  const startHold = useCallback(() => {
    setIsHolding(true);
    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const pct = Math.min(elapsed / holdDuration, 1);
      setProgress(pct);

      if (pct >= 1) {
        // Completed one cycle
        onComplete();
        setRipples((prev) => [...prev, rippleIdRef.current++]);

        if (autoCycle) {
          // Reset and continue
          startTimeRef.current = performance.now();
          setProgress(0);
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          setIsHolding(false);
          setProgress(0);
        }
        return;
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, [holdDuration, onComplete, autoCycle]);

  const endHold = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    setIsHolding(false);
    setProgress(0);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  // Clean up old ripples
  useEffect(() => {
    if (ripples.length > 3) {
      const timer = setTimeout(() => {
        setRipples((prev) => prev.slice(-3));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [ripples]);

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

      {/* Outer glow when holding */}
      <motion.div
        animate={{
          scale: isHolding ? 1.15 : 1,
          opacity: isHolding ? 0.2 : 0,
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="absolute rounded-full bg-primary"
        style={{ width: size + 40, height: size + 40 }}
      />

      {/* SVG progress ring */}
      <svg
        width={size}
        height={size}
        className="absolute -rotate-90"
        style={{ filter: isHolding ? "drop-shadow(0 0 12px hsl(38 70% 50% / 0.4))" : "none" }}
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 8}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="2"
          opacity={0.3}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 8}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition: isHolding ? "none" : "stroke-dashoffset 0.3s ease-out",
            filter: isHolding ? "drop-shadow(0 0 6px hsl(38 70% 50% / 0.6))" : "none",
          }}
        />
      </svg>

      {/* Touch target */}
      <motion.button
        onPointerDown={startHold}
        onPointerUp={endHold}
        onPointerLeave={endHold}
        onPointerCancel={endHold}
        whileTap={{ scale: 0.96 }}
        className="relative z-10 rounded-full flex items-center justify-center cursor-pointer touch-none"
        style={{ width: size - 24, height: size - 24 }}
        aria-label="اضغط مع التأمل"
      >
        <motion.div
          animate={{
            scale: isHolding ? [1, 1.08, 1] : 1,
            opacity: isHolding ? 1 : 0.6,
          }}
          transition={{
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 0.3 },
          }}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-primary font-naskh text-sm">
            {isHolding ? "تأمّل..." : "اضغط مع التأمل"}
          </span>
        </motion.div>
      </motion.button>
    </div>
  );
}
