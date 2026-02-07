import { motion } from "framer-motion";

interface DhikrFadlProps {
  fadl: string;
  onContinue: () => void;
}

export function DhikrFadl({ fadl, onContinue }: DhikrFadlProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-md flex flex-col items-center gap-8 text-center"
    >
      {/* Decorative line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-12 h-[1px] bg-primary/30"
      />

      <p className="fadl-text text-base sm:text-lg leading-[2] text-balance px-4">
        {fadl}
      </p>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        onClick={onContinue}
        className="text-primary/60 hover:text-primary transition-colors text-sm font-naskh"
      >
        التالي ←
      </motion.button>
    </motion.div>
  );
}
