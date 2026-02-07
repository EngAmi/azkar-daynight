import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DhikrSession } from "@/components/DhikrSession";
import type { SessionType } from "@/data/adhkar";

const Index = () => {
  const [sessionType, setSessionType] = useState<SessionType | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Determine current time period for subtle suggestion
  const hour = new Date().getHours();
  const suggestedType: SessionType = hour >= 15 ? "evening" : "morning";

  if (sessionType) {
    return (
      <DhikrSession
        type={sessionType}
        onExit={() => setSessionType(null)}
      />
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen items-center justify-center bg-background overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }}
          transition={{ duration: 3 }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary blur-[150px]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.04 }}
          transition={{ duration: 4, delay: 1 }}
          className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-glow-soft blur-[120px]"
        />
      </div>

      {/* Main content */}
      <AnimatePresence>
        {isReady && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center gap-12 px-6 max-w-md w-full"
          >
            {/* Title */}
            <div className="text-center space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="font-amiri text-4xl sm:text-5xl text-foreground tracking-wide"
              >
                ذِكر
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.7 }}
                className="font-naskh text-muted-foreground/60 text-sm leading-relaxed"
              >
                أذكار الصباح والمساء
              </motion.p>
            </div>

            {/* Decorative divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="w-16 h-[1px] bg-primary/20"
            />

            {/* Session choices */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="flex flex-col items-center gap-4 w-full"
            >
              <SessionButton
                label="أذكار الصباح"
                sublabel="☀️"
                onClick={() => setSessionType("morning")}
                isSuggested={suggestedType === "morning"}
              />
              <SessionButton
                label="أذكار المساء"
                sublabel="🌙"
                onClick={() => setSessionType("evening")}
                isSuggested={suggestedType === "evening"}
              />
            </motion.div>

            {/* Verse at bottom */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 2 }}
              className="font-amiri text-primary/30 text-sm text-center mt-8 leading-relaxed"
            >
              ﴿فَاذْكُرُونِي أَذْكُرْكُمْ﴾
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function SessionButton({
  label,
  sublabel,
  onClick,
  isSuggested,
}: {
  label: string;
  sublabel: string;
  onClick: () => void;
  isSuggested: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        w-full max-w-xs py-5 px-6 rounded-2xl
        glass-surface
        flex items-center justify-between
        transition-all duration-300
        group cursor-pointer
        ${isSuggested ? "border-primary/20" : "border-border/30"}
      `}
    >
      <span className="font-naskh text-lg text-foreground group-hover:text-primary transition-colors duration-300">
        {label}
      </span>
      <span className="text-lg opacity-60 group-hover:opacity-100 transition-opacity">
        {sublabel}
      </span>
    </motion.button>
  );
}

export default Index;
