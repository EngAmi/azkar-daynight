import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface CompletionScreenProps {
  sessionType: "morning" | "evening";
  totalAdhkar: number;
}

export function CompletionScreen({ sessionType, totalAdhkar }: CompletionScreenProps) {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const isMorning = sessionType === "morning";

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center p-6 z-50">
      {/* Subtle radial glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.15, scale: 1.5 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute w-64 h-64 rounded-full bg-primary blur-[100px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        className="relative text-center flex flex-col items-center gap-8 max-w-sm"
      >
        {/* Completion icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, type: "spring", damping: 12 }}
          className="w-16 h-16 rounded-full border-2 border-primary/40 flex items-center justify-center"
        >
          <motion.svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            <motion.path
              d="M5 13l4 4L19 7"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            />
          </motion.svg>
        </motion.div>

        {/* Main message */}
        <div className="space-y-4">
          <h2 className="font-amiri text-2xl text-foreground">
            {isMorning ? "أتممت أذكار الصباح" : "أتممت أذكار المساء"}
          </h2>

          {showContent && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="font-amiri text-lg text-primary/80 leading-relaxed"
            >
              ﴿أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ﴾
            </motion.p>
          )}
        </div>

        {/* Quiet pause then return */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 3 }}
          onClick={() => navigate("/")}
          className="mt-8 text-muted-foreground/60 text-sm font-naskh hover:text-muted-foreground transition-colors duration-300"
        >
          العودة
        </motion.button>
      </motion.div>
    </div>
  );
}
