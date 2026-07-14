import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getMorningAdhkar, getEveningAdhkar, type SessionType, type Dhikr } from "@/data/adhkar";
import { BreathingCircle } from "@/components/BreathingCircle";
import { SessionProgress } from "@/components/SessionProgress";
import { CompletionScreen } from "@/components/CompletionScreen";
import { DhikrFadl } from "@/components/DhikrFadl";
import { shareDhikrAsImage } from "@/lib/shareDhikrImage";
import { toast } from "@/hooks/use-toast";
import { Share2 } from "lucide-react";

interface DhikrSessionProps {
  type: SessionType;
  onExit: () => void;
}

export function DhikrSession({ type, onExit }: DhikrSessionProps) {
  const adhkarList = useMemo(
    () => (type === "morning" ? getMorningAdhkar() : getEveningAdhkar()),
    [type]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentRep, setCurrentRep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFadl, setShowFadl] = useState(false);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [isSharing, setIsSharing] = useState(false);

  const currentDhikr: Dhikr | undefined = adhkarList[currentIndex];

  const handleShare = useCallback(async () => {
    if (!currentDhikr || isSharing) return;
    setIsSharing(true);
    try {
      const result = await shareDhikrAsImage({
        content: currentDhikr.content,
        source: currentDhikr.source,
        sessionType: type,
      });
      if (result === "downloaded") {
        toast({
          title: "تم حفظ الصورة",
          description: "يمكنك مشاركتها من مجلد التنزيلات.",
        });
      }
    } catch {
      toast({
        title: "تعذّرت المشاركة",
        description: "حاول مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  }, [currentDhikr, isSharing, type]);


  const handleRepComplete = useCallback(() => {
    if (!currentDhikr) return;

    const newRep = currentRep + 1;

    if (newRep >= currentDhikr.count) {
      // This dhikr is complete
      if (currentDhikr.fadl) {
        setShowFadl(true);
      } else {
        moveToNext();
      }
    } else {
      setCurrentRep(newRep);
    }
  }, [currentDhikr, currentRep]);

  const moveToNext = useCallback(() => {
    setShowFadl(false);
    if (currentIndex + 1 >= adhkarList.length) {
      setIsCompleted(true);
    } else {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
      setCurrentRep(0);
    }
  }, [currentIndex, adhkarList.length]);

  const handleSkip = useCallback(() => {
    setShowFadl(false);
    if (currentIndex + 1 >= adhkarList.length) {
      setIsCompleted(true);
    } else {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
      setCurrentRep(0);
    }
  }, [currentIndex, adhkarList.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex === 0) return;
    setShowFadl(false);
    setDirection(-1);
    setCurrentIndex((prev) => prev - 1);
    setCurrentRep(0);
  }, [currentIndex]);

  const canGoPrevious = currentIndex > 0;

  // Keyboard shortcuts (RTL-aware): ArrowRight = previous, ArrowLeft = next.
  // Escape exits the session.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.altKey || e.ctrlKey || e.metaKey) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (canGoPrevious) handlePrevious();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleSkip();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onExit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [canGoPrevious, handlePrevious, handleSkip, onExit]);

  if (isCompleted) {
    return <CompletionScreen sessionType={type} totalAdhkar={adhkarList.length} />;
  }

  if (!currentDhikr) return null;

  const isHighCount = currentDhikr.count >= 10;

  return (
    <div className="fixed inset-0 bg-background flex flex-col z-50">
      {/* Screen-reader live announcement of current dhikr position */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {`الذكر ${currentIndex + 1} من ${adhkarList.length}`}
      </div>

      {/* Minimal top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 safe-area-top">
        <button
          onClick={onExit}
          aria-label="إنهاء الجلسة (Escape)"
          aria-keyshortcuts="Escape"
          className="text-muted-foreground/40 hover:text-muted-foreground transition-colors text-sm font-naskh p-2"
        >
          إنهاء
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            aria-label="الذكر السابق (سهم يمين)"
            title="السابق — سهم يمين"
            aria-keyshortcuts="ArrowRight"
            className="text-muted-foreground/40 hover:text-muted-foreground transition-colors text-sm font-naskh p-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-muted-foreground/40"
          >
            → السابق
          </button>
          <button
            onClick={handleSkip}
            aria-label="الذكر التالي (سهم يسار)"
            title="التالي — سهم يسار"
            aria-keyshortcuts="ArrowLeft"
            className="text-muted-foreground/40 hover:text-muted-foreground transition-colors text-sm font-naskh p-2"
          >
            تخطي ←
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="px-6">
        <SessionProgress
          current={currentIndex + 1}
          total={adhkarList.length}
          currentRep={currentRep}
          totalReps={currentDhikr.count}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {showFadl ? (
            <DhikrFadl
              key="fadl"
              fadl={currentDhikr.fadl}
              onContinue={moveToNext}
            />
          ) : (
            <motion.div
              key={currentDhikr.id + "-" + currentIndex}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-lg flex flex-col items-center gap-8"
            >
              {/* Dhikr text */}
              <div className="w-full text-center">
                <p
                  className="dhikr-text text-xl sm:text-2xl leading-[2.4] text-balance"
                  style={{
                    fontSize: currentDhikr.content.length > 200 ? "1.1rem" : currentDhikr.content.length > 100 ? "1.25rem" : "1.5rem",
                  }}
                >
                  {currentDhikr.content}
                </p>
              </div>

              {/* Breathing circle interaction */}
              <div className="flex-shrink-0">
                <BreathingCircle
                  onComplete={handleRepComplete}
                  size={isHighCount ? 160 : 180}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Source at bottom */}
      <div className="px-6 pb-6 safe-area-bottom">
        <p className="text-center text-[11px] text-muted-foreground/30 font-naskh leading-relaxed truncate">
          {currentDhikr.source}
        </p>
      </div>
    </div>
  );
}
