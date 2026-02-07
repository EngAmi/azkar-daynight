import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getMorningAdhkar, getEveningAdhkar, type SessionType, type Dhikr } from "@/data/adhkar";
import { BreathingCircle } from "@/components/BreathingCircle";
import { SessionProgress } from "@/components/SessionProgress";
import { DhikrFadl } from "@/components/DhikrFadl";

const Index = () => {
  const [isReady, setIsReady] = useState(false);

  // Determine current time period for default tab
  const hour = new Date().getHours();
  const defaultType: SessionType = hour >= 15 ? "evening" : "morning";
  const [activeTab, setActiveTab] = useState<SessionType>(defaultType);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex flex-col min-h-screen bg-background overflow-hidden">
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
            className="relative z-10 flex flex-col items-center w-full flex-1"
          >
            {/* Header */}
            <div className="text-center pt-8 pb-4 px-6 safe-area-top">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="font-amiri text-3xl sm:text-4xl text-foreground tracking-wide"
              >
                ذِكر
              </motion.h1>
            </div>

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex items-center justify-center gap-2 px-6 pb-4"
            >
              <TabButton
                label="أذكار الصباح"
                icon="☀️"
                isActive={activeTab === "morning"}
                onClick={() => setActiveTab("morning")}
              />
              <TabButton
                label="أذكار المساء"
                icon="🌙"
                isActive={activeTab === "evening"}
                onClick={() => setActiveTab("evening")}
              />
            </motion.div>

            {/* Session content */}
            <div className="flex-1 w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: activeTab === "morning" ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: activeTab === "morning" ? 30 : -30 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="h-full"
                >
                  <InlineSession type={activeTab} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Verse at bottom */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 2 }}
              className="font-amiri text-primary/30 text-sm text-center px-6 pb-6 safe-area-bottom leading-relaxed"
            >
              ﴿فَاذْكُرُونِي أَذْكُرْكُمْ﴾
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function TabButton({
  label,
  icon,
  isActive,
  onClick,
}: {
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={`
        relative py-2.5 px-5 rounded-xl font-naskh text-sm
        transition-all duration-300 cursor-pointer
        ${
          isActive
            ? "text-primary-foreground"
            : "text-muted-foreground/60 hover:text-muted-foreground"
        }
      `}
    >
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 rounded-xl glass-surface border-primary/20"
          style={{ borderWidth: 1 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        <span>{icon}</span>
        <span>{label}</span>
      </span>
    </motion.button>
  );
}

function InlineSession({ type }: { type: SessionType }) {
  const adhkarList = useMemo(
    () => (type === "morning" ? getMorningAdhkar() : getEveningAdhkar()),
    [type]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentRep, setCurrentRep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFadl, setShowFadl] = useState(false);
  const [direction, setDirection] = useState(1);

  const currentDhikr: Dhikr | undefined = adhkarList[currentIndex];

  const handleRepComplete = () => {
    if (!currentDhikr) return;
    const newRep = currentRep + 1;
    if (newRep >= currentDhikr.count) {
      if (currentDhikr.fadl) {
        setShowFadl(true);
      } else {
        moveToNext();
      }
    } else {
      setCurrentRep(newRep);
    }
  };

  const moveToNext = () => {
    setShowFadl(false);
    if (currentIndex + 1 >= adhkarList.length) {
      setIsCompleted(true);
    } else {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
      setCurrentRep(0);
    }
  };

  const handleSkip = () => {
    setShowFadl(false);
    if (currentIndex + 1 >= adhkarList.length) {
      setIsCompleted(true);
    } else {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
      setCurrentRep(0);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setCurrentRep(0);
    setIsCompleted(false);
    setShowFadl(false);
  };

  if (isCompleted) {
    return <InlineCompletion sessionType={type} onRestart={handleRestart} />;
  }

  if (!currentDhikr) return null;

  const isHighCount = currentDhikr.count >= 10;

  return (
    <div className="flex flex-col h-full">
      {/* Skip button */}
      <div className="flex justify-start px-6 pb-2">
        <button
          onClick={handleSkip}
          className="text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors text-xs font-naskh p-1"
        >
          تخطي ←
        </button>
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
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 overflow-hidden">
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
              className="w-full max-w-lg flex flex-col items-center gap-6"
            >
              {/* Dhikr text */}
              <div className="w-full text-center">
                <p
                  className="dhikr-text text-xl sm:text-2xl leading-[2.4] text-balance"
                  style={{
                    fontSize:
                      currentDhikr.content.length > 200
                        ? "1.1rem"
                        : currentDhikr.content.length > 100
                          ? "1.25rem"
                          : "1.5rem",
                  }}
                >
                  {currentDhikr.content}
                </p>
              </div>

              {/* Breathing circle interaction */}
              <div className="flex-shrink-0">
                <BreathingCircle
                  onComplete={handleRepComplete}
                  holdDuration={isHighCount ? 1800 : 2800}
                  autoCycle={isHighCount}
                  size={isHighCount ? 140 : 160}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Source at bottom */}
      <div className="px-6 pb-2">
        <p className="text-center text-[11px] text-muted-foreground/30 font-naskh leading-relaxed truncate">
          {currentDhikr.source}
        </p>
      </div>
    </div>
  );
}

function InlineCompletion({
  sessionType,
  onRestart,
}: {
  sessionType: SessionType;
  onRestart: () => void;
}) {
  const [showContent, setShowContent] = useState(false);
  const isMorning = sessionType === "morning";

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center p-6">
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

        {/* Restart button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 3 }}
          onClick={onRestart}
          className="mt-8 text-muted-foreground/60 text-sm font-naskh hover:text-muted-foreground transition-colors duration-300"
        >
          إعادة
        </motion.button>
      </motion.div>
    </div>
  );
}

export default Index;
